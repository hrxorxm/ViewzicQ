from io import BytesIO
import os
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3
from PIL import Image, ImageEnhance
from django.core.files.base import ContentFile


def extract_image(path):
    tags = ID3(path)
    pict = tags.get("APIC:").data
    im = Image.open(BytesIO(pict))

    im = im.resize((505, 505))
    im = ReduceOpacity(im, 0.4)
    im.convert("RGB")

    info = EasyID3(path)
    title = info['title'][0].encode("iso-8859-1").decode("cp949")
    artist = info['artist'][0].encode("iso-8859-1").decode("cp949")

    img_io = BytesIO()
    im.save(img_io, format='PNG', qualtiy=100)
    img_content = ContentFile(img_io.getvalue(), title + ".png")

    return img_content, title, artist


def ReduceOpacity(img, opacity):
    assert opacity >= 0 and opacity <= 1
    if img.mode != 'RGBA':
        im = img.convert('RGBA')
    else:
        im = img.copy()
    alpha = im.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    im.putalpha(alpha)
    return im