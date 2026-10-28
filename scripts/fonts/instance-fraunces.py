"""Gera src/styles/fonts/fraunces-latin.woff2: a Fraunces latin do fontsource
(`full`) com SOFT fixado em 0, mantendo wght, opsz e WONK.

Ferramenta só de desenvolvimento (design §8). Rode num venv fora do repo:

    py -3.12 -m venv <fora-do-repo>/venv-fonts
    <fora-do-repo>/venv-fonts/Scripts/python -m pip install fonttools brotli
    <fora-do-repo>/venv-fonts/Scripts/python -I scripts/fonts/instance-fraunces.py

Por que o wght fica inteiro: o site só usa wght 600, mas o padrão do arquivo é
900. Fixar ou restringir o wght recalcula os deltas e os arredonda para
unidades inteiras, e a regressão visual (threshold 0) acusa de 16 a 215 pixels
por captura. SOFT 0 é o valor padrão do eixo: fixá-lo só descarta deltas, sem
arredondar nada. `--wght-min/--wght-max` reproduzem a tentativa (ver
scripts/fonts/README.md e docs/gate-4/PERFORMANCE.md).
"""

import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (
    ROOT
    / "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2"
)
OUTPUT = ROOT / "src/styles/fonts/fraunces-latin.woff2"

# O mesmo unicode-range do latin do fontsource (unicode.json do pacote).
LATIN_RANGE = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
    "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,"
    "U+FEFF,U+FFFD"
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--wght-min", type=float, help="só para experimentar")
    parser.add_argument("--wght-max", type=float, help="só para experimentar")
    args = parser.parse_args()

    limits: dict[str, object] = {"SOFT": 0}
    if args.wght_min is not None or args.wght_max is not None:
        low = args.wght_min if args.wght_min is not None else args.wght_max
        high = args.wght_max if args.wght_max is not None else args.wght_min
        limits["wght"] = low if low == high else (low, high)

    # Eixos fora de `limits` (opsz, WONK e, por padrão, wght) ficam inteiros.
    font = instancer.instantiateVariableFont(TTFont(args.source), limits)

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.hinting = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(LATIN_RANGE))
    subsetter.subset(font)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(args.output), options)
    before = args.source.stat().st_size
    after = args.output.stat().st_size
    print(
        f"{args.output.name}: {after} B (fonte: {before} B, "
        f"{(1 - after / before) * 100:.1f}% menor)"
    )


if __name__ == "__main__":
    main()
