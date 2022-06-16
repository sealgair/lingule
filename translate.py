import json
import sys
from pathlib import Path

from google.cloud import translate_v2 as translate


def deconstruct(data, prefix=""):
    pairs = []
    for k, v in data.items():
        if isinstance(v, str):
            pairs.append((prefix + k, v))
        elif isinstance(v, dict):
            pairs.extend(deconstruct(v, prefix + k + '.'))
    return pairs


def reconstruct(pairs):
    data = {}
    for keys, v in pairs:
        keys = keys.split('.')
        key = keys.pop(-1)
        subdata = data
        for layer in keys:
            subdata = subdata.setdefault(layer, {})
        subdata[key] = v
    return data


def translate_file(dest, source='en'):
    basedir = Path(__file__).resolve().parent

    with open(basedir / f"frontend/public/locales/{source}/translation.json") as file:
        data = json.load(file)
    pairs = deconstruct(data)
    keys = [k for k, v in pairs]
    values = [v for k, v in pairs]
    translate_client = translate.Client()
    results = translate_client.translate(values, target_language=dest, source_language=source)
    data = reconstruct([
        (k, result['translatedText']) for k, result in zip(keys, results)
    ])
    with open(basedir / f"frontend/public/locales/{dest}/translation.json", 'w') as file:
        out = json.dumps(data, indent=2, ensure_ascii=False).encode('utf8')
        file.write(out.decode())


if __name__ == "__main__":
    translate_file(*sys.argv[1:])