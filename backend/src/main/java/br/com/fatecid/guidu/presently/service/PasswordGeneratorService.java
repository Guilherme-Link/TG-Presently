package br.com.fatecid.guidu.presently.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class PasswordGeneratorService {

    private static final String CHARSET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int DEFAULT_LENGTH = 10;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        return generate(DEFAULT_LENGTH);
    }

    public String generate(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("A senha temporária deve ter ao menos 8 caracteres.");
        }

        StringBuilder password = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(CHARSET.length());
            password.append(CHARSET.charAt(index));
        }

        return password.toString();
    }
}
