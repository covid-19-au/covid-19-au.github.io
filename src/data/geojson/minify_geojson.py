import json
from os import listdir


def get_minified(path):
    with open(path, 'r', encoding='utf-8') as f:
        geojson = json.loads(f.read())

    new_features = []
    for feature in geojson['features']:
        if not feature['geometry']:
            continue
        
        for key in (
            'id',
            'lg_ply_pid',
            'dt_create',
            'dt_retire',
            'lga_pid',
            'tas_lga_sh',
        ):
            if key in feature:
                del feature[key]




for fnam in listdir('.'):
    if not fnam.endswith('.geojson'):
        continue

