from django import template

register = template.Library()

@register.filter
def add(value1, value2):
    try:
        if (int(value1) + int(value2)) > 0:
            return int(value1) + int(value2)
        else:
            return 0
    except (ValueError, TypeError):
        return 0