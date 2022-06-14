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
