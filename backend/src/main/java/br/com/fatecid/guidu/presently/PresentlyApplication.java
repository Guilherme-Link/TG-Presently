package br.com.fatecid.guidu.presently;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

import br.com.fatecid.guidu.presently.config.IniPropertySourceFactory;

@SpringBootApplication
@PropertySource(value = "file:./config.ini", factory = IniPropertySourceFactory.class, ignoreResourceNotFound = true)
public class PresentlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(PresentlyApplication.class, args);
	}

}
