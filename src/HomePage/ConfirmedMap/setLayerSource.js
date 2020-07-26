function setLayerSource(map, layerId, source, sourceLayer) {
    const oldLayers = map.getStyle().layers;
    const layerIndex = oldLayers.findIndex(l => l.id === layerId);
    const layerDef = oldLayers[layerIndex];
    const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
    layerDef.source = source;
    if (sourceLayer) {
        layerDef['source-layer'] = sourceLayer;
    }
    map.removeLayer(layerId);
    map.addLayer(layerDef, before);
}

export default setLayerSource;
