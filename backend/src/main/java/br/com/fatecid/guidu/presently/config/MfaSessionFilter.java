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
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "A senha precisa ser validada antes da passkey.");
                return;
            }
            filterChain.doFilter(request, response);
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
}
