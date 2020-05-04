import json
from os import listdir


def get_minified(path):
    with open(path, 'r', encoding='utf-8') as f:
        geojson = json.loads(
            f.read(),
            parse_float=lambda x: round(float(x), 3)
        )

    new_features = []
    for feature in geojson['features']:
        if not feature['geometry']:
            continue
        elif 'unincorporated' in str(feature).lower() and not 'pastoral' in str(feature).lower():
            continue

        for key in (
            'id',
            'lg_ply_pid',
            'dt_create',
            'dt_retire',
            'lga_pid',
            'lga_sh',
            'lga__1',
            'stat_2',
            '_state_',
            '_stat_1',
            '_stat_2',
            '_stat_3',
            '_stat_4',
            '_stat_5',
            '_state_s',
            '_state_1',
            '_state_2',
            '_state_3',
            '_state_4',
            '_state_5',
        ):
            if key in feature['properties']:
                del feature['properties'][key]

            for i_key in list(feature['properties']):
                if i_key.endswith(key):
                    del feature['properties'][i_key]

        new_features.append(feature)

    geojson['features'] = new_features

    encoded = json.dumps(geojson, separators=(',', ':'))
    with open(path, 'w', encoding='utf-8') as f:
        f.write(encoded)


for fnam in listdir('.'):
    if not fnam.endswith('.geojson'):
        continue
    get_minified(fnam)
