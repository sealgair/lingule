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
            'meaning': solution.all_languages,
            'order': solution.order,
            'answer': solution.language.all_languages,
            'victory_message': solution.victory_message,
            'failure_message': solution.failure_message,
            'hidden_options': [
                {'name': l.name, 'id': l.id} for l in solution.hidden_options.all()
            ]
        }
        if solution.romanization:
            data['romanization'] = solution.romanization
            try:
                data['font'] = solution.font_url
            except ValueError:
                pass  #whoops -- some problem with the font
        if solution.vertical:
            data['vertical'] = True
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

        none = {
            'en': "(None)",
            'es': "(ninguna)",
            'fr': "(rien)",
            'zh': "(毫无)",
            'ar': "(لا أحد)",
        }

        return {
            'success': hint['language'],
            'language': guess.all_languages,
            'macroarea': guess.macroarea.all_languages,
            'family': guess.family.all_languages,
            'subfamily': guess.subfamily.all_languages if guess.subfamily else none,
            'genus': guess.genus.all_languages if guess.genus else none,
            'hint': hint,
            'latitude': guess.latitude,
            'longitude': guess.longitude,
        }
