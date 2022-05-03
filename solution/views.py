from datetime import timezone, timedelta, date, datetime

from django.http import Http404
from django.shortcuts import get_object_or_404

from language.models import Language
from lingule.utils import ApiView
from solution.models import Solution


class WordView(ApiView):
    def get(self, request):
        tzoff = request.GET.get('tz', 0)
        tz = timezone(timedelta(minutes=-int(tzoff)))
        date = datetime.now(tz).date()
        try:
            solution = Solution.objects.get(date=date)
        except Solution.DoesNotExist:
            raise Http404()
        return {
            'id': solution.id,
            'word': solution.word,
            'ipa': solution.ipa,
            'meaning': solution.english,
            'order': solution.order,
            'answer': solution.language.name,
        }


class GuessView(ApiView):
    def get(self, request):
        guess = get_object_or_404(Language, id=request.GET.get('language', None))
        solution = get_object_or_404(Solution, id=request.GET.get('solution', None))
        return {
            'success': guess == solution.language,
            'language': guess.name,
            'hint': guess.compare(solution.language),
        }
