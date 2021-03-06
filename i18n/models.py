from django.contrib.contenttypes.models import ContentType
from django.db import models
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import translate_v2 as translate


class Translatable(models.Model):
    translated_field = 'name'
    translation_fields = ('es', 'fr', 'zh')
    es = models.TextField(verbose_name="spanish", blank=True)
    fr = models.TextField(verbose_name="french", blank=True)
    zh = models.TextField(verbose_name="chinese", blank=True)

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
        try:
            translate_client = translate.Client()

            text = getattr(self, self.translated_field)
            for lc in languages:
                translation = getattr(self, lc)
                if translation and not overwrite:
                    continue
                result = translate_client.translate(text, target_language=lc, source_language='en')
                setattr(self, lc, result['translatedText'])
            if commit:
                self.save()
        except DefaultCredentialsError:
            pass

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        languages = self.translation_fields
        if update_fields:
            languages = [l for l in languages if l in update_fields]
        self.translate(languages=languages, overwrite=False, commit=False)
        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)

