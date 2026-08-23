package br.com.fatecid.guidu.presently.mapper;

import java.util.Arrays;
import java.util.List;

import org.locationtech.jts.geom.*;

import br.com.fatecid.guidu.presently.dto.GeoJsonPolygonDTO;

public class GeoJsonMapper {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory();

    // Converte um objeto de geometria polygon para o DTO de polygon
    public static Polygon toPolygon(GeoJsonPolygonDTO dto) {

        if (dto == null) return null;

        // A conversão só se aplica pra geojson do tipo polígono
        if (!dto.type().equals("Polygon")) {
            throw new IllegalArgumentException("Tipo deve ser Polygon");
        }

        // Usa a geometryfactory para transformar o contorno em um tipo polígono
        LinearRing shell = GEOMETRY_FACTORY.createLinearRing(
            dto.coordinates()
               .get(0)
               .stream()
               .map(c -> new Coordinate(c.get(0), c.get(1)))
               .toArray(Coordinate[]::new)
        );

        return GEOMETRY_FACTORY.createPolygon(shell);
    }

    // Converte um DTO de polygon de volta para um objeto de geometria Polygon
    public static GeoJsonPolygonDTO fromPolygon(Polygon polygon) {

        if (polygon == null) return null;

        // Separa os pontos de coordenada do polígono e mapeia para uma lista de pares double
        List<List<Double>> exteriorRing = Arrays.stream(polygon.getCoordinates())
            .map(c -> List.of(c.x, c.y))
            .toList();

        // Set do tipo polígono no geojson e atribui a lista de coordenadas
        return new GeoJsonPolygonDTO(
            "Polygon",
            List.of(exteriorRing)
        );
    }
}