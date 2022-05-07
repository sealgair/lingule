import os.path
import string
import tempfile
from datetime import date, timedelta

from django.conf import settings
from django.core.management import BaseCommand, call_command
from fontTools import subset, merge


class Command(BaseCommand):
    help = 'Build font files'

    def make_fonts(self, text, serif='Sans', weight='Regular'):
        subsetter = subset.Subsetter()
        merger = merge.Merger()
        subsetter.populate(text=text)
        options = subset.Options(
            ignore_missing_glyphs=True,
            recalc_bounds=True,
            recalc_average_width=True,
            recalc_max_context=True,
            obfuscate_names=True,
            notdef_glyph=False,
            verbose=True,
        )

        fonts_dir = settings.BASE_DIR / "fonts"
        files = list(fonts_dir.rglob(f"*{serif}*-{weight}.ttf"))
        subsetfiles = []
        with tempfile.TemporaryDirectory() as tdir:
            for file in files:
                font = subset.load_font(file, options)
                if os.path.basename(file) != f'Noto{serif}-{weight}.ttf':
                    subsetter.subset(font)
                if len(font.getGlyphOrder()) > 1:
                    tf = os.path.join(tdir, os.path.basename(file))
                    font.save(tf)
                    subsetfiles.append(tf)
            font = merger.merge(subsetfiles)
        savedir = fonts_dir / 'Subset/fonts'
        savedir.mkdir(parents=True, exist_ok=True)
        font.save(savedir/f'Noto{serif}-{weight}.ttf')

    def handle(self, *args, **options):
        from solution.models import Solution

        unicodes = set()
        for word in Solution.objects.filter(date__gte=date.today() - timedelta(days=1)):
            unicodes |= set(word.word) | set(word.romanization) | set(word.ipa)
        unicodes -= set(string.ascii_letters+string.digits+r":-\/[].'")

        text = "".join(unicodes)
        self.make_fonts(text, 'Sans')
        self.make_fonts(text, 'Serif')
        self.make_fonts(text, 'Serif', 'Italic')

        call_command("collectstatic", interactive=False)

