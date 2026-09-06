# CAESTHETIC Social Cases — English Source Kit

Version 1.1.0. All current publication inputs and handoff text are in American English.

Install Python dependencies `reportlab`, `fonttools`, `PyMuPDF` and `Pillow`, and the system `ffmpeg` executable. From the extracted `pilot` directory, run:

```sh
python build_pack.py --content content.json --assets assets --output output
```

The renderer requires an English-only `languages.en` payload. It checks metric denominators, numerators, rounding, caption length and text geometry. It rejects Cyrillic text in publication inputs. It does not invent stories or publish content.

Keep `article-en.md` and `README_EN.md` next to `content.json`. The renderer exports the article, slides, short-post image, captions, optional first comments, narration script and MP4. Intermediate fonts and frames are stored in `output/_build` and should not be uploaded to social platforms. Inspect rendered output after changing copy.

For another case, prepare its own English input and article from that case's verified source. Reuse the visual system while retaining the case-specific intervention, measurements and limitations.

The asset manifest records the canonical logo, token snapshot, font sources and licenses. The original bilingual delivery and the earlier 33-story manuscript remain historical references in the SSOT artifact register; they are not included in this English publication source kit.

This source kit is an internal production handoff. Use only the selected output assets and text fields when publishing.
