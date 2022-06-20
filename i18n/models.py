from django.contrib.contenttypes.models import ContentType
from django.db import models
from google.cloud import translate_v2 as translate


class Translatable(models.Model):
    translated_field = 'name'
    translation_fields = ('es', 'fr')
    es = models.TextField(verbose_name="spanish")
    fr = models.TextField(verbose_name="french")

    class Meta:
        abstract = True

    def get_language(self, language, default='en'):
        langs = self.all_languages
        return langs.get(language, langs.get(default))

    @property
    def all_languages(self):
        data = {'en': getattr(self, self.translated_field)}
        data.update({
            lang: getattr(self, lang)
            for lang in self.translation_fields
        })
        return data

    def translate(self, languages=None, overwrite=False, commit=True):
        if languages is None:
            languages = self.translation_fields
        translate_client = translate.Client()

        text = getattr(self, self.translated_field)
        for lc in languages:
            translation = getattr(self, lc)
            if translation and not overwrite:
                break
            result = translate_client.translate(text, target_language=lc, source_language='en')
            setattr(self, lc, result['translatedText'])
        if commit:
            self.save()

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        languages = self.translation_fields
        if update_fields:
            languages = [l for l in languages if l in update_fields]
        self.translate(languages=languages, overwrite=False, commit=False)
        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)

