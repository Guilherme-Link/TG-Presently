package br.com.fatecid.guidu.presently.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

public class IniPropertySourceFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
        Properties properties = new Properties();
        String section = "";

        try (var reader = new BufferedReader(new InputStreamReader(
                resource.getResource().getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith(";")) {
                    continue;
                }

                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    section = trimmed.substring(1, trimmed.length() - 1).trim();
                    if (section.isEmpty()) {
                        throw new IOException("Seção INI vazia na linha " + lineNumber);
                    }
                    continue;
                }

                int separator = trimmed.indexOf('=');
                if (separator < 1) {
                    throw new IOException("Entrada INI inválida na linha " + lineNumber);
                }

                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                String propertyName = section.isEmpty() ? key : section + "." + key;
                properties.setProperty(propertyName, value);
            }
        }

        String sourceName = name != null ? name : resource.getResource().getDescription();
        return new PropertiesPropertySource(sourceName, properties);
    }
}
