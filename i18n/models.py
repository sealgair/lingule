from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models

LANGUAGE_CHOICES = (
    ('es', 'Spanish'),
    ('fr', 'French'),
    # ('zh', 'Chinese'),
    # ('ar', 'Arabic'),
)


class Translation(models.Model):
    language = models.CharField(max_length=3, choices=LANGUAGE_CHOICES)
    value = models.TextField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        unique_together = ['language', 'object_id', 'content_type']


class Translatable(models.Model):
    translations = GenericRelation(Translation)

    class Meta:
        abstract = True

    def get_language(self, language, default='en', fname='name'):
        langs = self.all_languages(fname=fname)
        return langs.get(language, langs.get(default))

    def all_languages(self, fname='name'):
        data = {'en': getattr(self, fname)}
        data.update({
            trans.language: trans.value
            for trans in self.translations.all()
        })
        return data