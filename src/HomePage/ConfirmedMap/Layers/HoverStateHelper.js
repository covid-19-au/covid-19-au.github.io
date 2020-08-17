class HoverStateHelper {
    constructor(map) {
        this.map = map;
        this.sourceIds = [];
    }

    associateLayerId(layerId) {
        this.map.on("mousemove", layerId, (e) => {
            this.__onMouseEnterFeature(e)
        });
        this.map.on("mouseleave", layerId, (e) => {
            this.__onMouseLeaveFeature(e)
        });
    }

    associateSourceId(sourceId) {
        this.sourceIds.push(sourceId);
    }

    __onMouseEnterFeature(e) {
        if (e.features.length > 0 && e.features[0].id !== this.__highlightedId) {
            if (this.__highlightedId) {
                for (let sourceId of this.sourceIds) {
                    this.map.removeFeatureState({
                        source: sourceId,
                        id: this.__highlightedId
                    });
                }
            }

            this.__highlightedId = e.features[0].id;

            for (let sourceId of this.sourceIds) {
                this.map.setFeatureState({
                    source: sourceId,
                    id: e.features[0].id,
                }, {
                    hover: true
                });
            }
        }
    }

    __onMouseLeaveFeature(e) {
        if (this.__highlightedId) {
            for (let sourceId of this.sourceIds) {
                this.map.setFeatureState({
                    source: sourceId,
                    id: this.__highlightedId
                }, {
                    hover: false
                });
            }
            delete this.__highlightedId;
        }
    }
}

export default HoverStateHelper;
