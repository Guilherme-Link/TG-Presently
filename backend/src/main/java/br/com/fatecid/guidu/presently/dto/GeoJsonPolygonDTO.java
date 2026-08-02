package br.com.fatecid.guidu.presently.dto;

import java.util.List;

public record GeoJsonPolygonDTO(
    String type,
    List<List<List<Double>>> coordinates
) {}
