from django.db import models


class Macroarea(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Family(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Subfamily(models.Model):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Genus(models.Model):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.TextField(unique=True)
    lang_id = models.TextField()
    latitude = models.DecimalField(decimal_places=11, max_digits=14)
    longitude = models.DecimalField(decimal_places=11, max_digits=14)

    macroarea = models.ForeignKey(Macroarea, on_delete=models.CASCADE)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, on_delete=models.CASCADE)
    genus = models.ForeignKey(Genus, null=True, on_delete=models.CASCADE)

    class Meta:
        db_table = 'language'

    def __str__(self):
        return self.name
