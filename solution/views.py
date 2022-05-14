from datetime import timezone, timedelta, date, datetime

from django.http import Http404
from django.shortcuts import get_object_or_404

from language.models import Language
from lingule.utils import ApiView
from solution.models import Solution


class WordView(ApiView):

    def get_date(self, request):
        tzoff = request.GET.get('tz', 0)
        tz = timezone(timedelta(minutes=-int(tzoff)))
        return datetime.now(tz).date()

    def cache_vary(self, request, *args, **kwargs):
        return [
            str(self.get_date(request))
        ]

    def get(self, request):
        date = self.get_date(request)
        try:
            solution = Solution.objects.get(date=date)
        except Solution.DoesNotExist:
            raise Http404()
        data = {
            'id': solution.id,
            'word': solution.word,
            'ipa': solution.ipa,
            'meaning': solution.english,
            'order': solution.order,
            'answer': solution.language.name,
        }
        if solution.romanization:
            data['romanization'] = solution.romanization
            data['font'] = solution.font_url
        return data


class GuessView(ApiView):
    def cache_vary(self, request, *args, **kwargs):
        return [
            request.GET.get('solution', 'None„'),
            request.GET.get('language', 'None')
        ]

    def get(self, request):
        guess = get_object_or_404(Language, id=request.GET.get('language', None))
        solution = get_object_or_404(Solution, id=request.GET.get('solution', None))
        hint = guess.compare(solution.language)
        if guess in solution.alternates.all():
            hint = guess.compare(guess)
        return {
            'success': guess == solution.language,
            'language': guess.name,
            'macroarea': guess.macroarea.name,
            'family': guess.family.name,
            'subfamily': guess.subfamily.name if guess.subfamily else "(None)",
            'genus': guess.genus.name if guess.genus else "(None)",
            'hint': hint,
            'latitude': guess.latitude,
            'longitude': guess.longitude,
        }
