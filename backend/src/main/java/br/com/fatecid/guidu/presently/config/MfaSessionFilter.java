package br.com.fatecid.guidu.presently.config;

import java.io.IOException;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class MfaSessionFilter extends OncePerRequestFilter {

    public static final String PENDING_USERNAME = "presently.mfa.pending.username";
    public static final String ATTENDANCE_PASSKEY_VERIFIED_AT = "presently.attendance.passkey.verified-at";

    private static final Set<String> MFA_FLOW_PATHS = Set.of(
            "/webauthn/authenticate/options",
            "/login/webauthn",
            "/security/v1/csrf",
            "/security/v1/mfa/cancel"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String pendingUsername = session == null
                ? null
                : (String) session.getAttribute(PENDING_USERNAME);

        if (pendingUsername == null) {
            String path = request.getServletPath();
            if ("/login/webauthn".equals(path)
                    || "/webauthn/authenticate/options".equals(path)) {
                Authentication currentAuthentication = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication();
                if (currentAuthentication == null
                        || !currentAuthentication.isAuthenticated()
                        || currentAuthentication.getAuthorities().stream()
                                .anyMatch(authority -> "ROLE_ANONYMOUS".equals(authority.getAuthority()))) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Entre na sua conta antes de confirmar a passkey.");
                    return;
                }
            }
            filterChain.doFilter(request, response);
            rememberAttendancePasskey(request, path);
            return;
        }

        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (hasWebAuthnFactor(authentication)
                && pendingUsername.equals(authentication.getName())) {
            session.removeAttribute(PENDING_USERNAME);
            filterChain.doFilter(request, response);
            return;
        }

        if (MFA_FLOW_PATHS.contains(request.getServletPath())) {
            filterChain.doFilter(request, response);
            rememberAttendancePasskey(request, request.getServletPath());
            return;
        }

        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Conclua a verificação com sua passkey.");
    }

    private boolean hasWebAuthnFactor(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("FACTOR_WEBAUTHN"::equals);
    }

    private void rememberAttendancePasskey(HttpServletRequest request, String path) {
        if (!"/login/webauthn".equals(path)) {
            return;
        }
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (hasWebAuthnFactor(authentication)) {
            request.getSession(true).setAttribute(ATTENDANCE_PASSKEY_VERIFIED_AT, System.currentTimeMillis());
        }
    }
}
