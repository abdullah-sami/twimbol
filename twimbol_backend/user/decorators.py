from django.contrib.auth.decorators import user_passes_test



def group_required(*group_names):
    
    def in_groups(u):
        if u.is_superuser:
            return True

        if u.is_authenticated:
            if u.groups.filter(name__in=group_names).exists():
                return True

    return user_passes_test(in_groups, login_url='login')



admin_required = group_required('admin')
creator_required = group_required('creator', 'admin')
visitor_required = group_required('visitor', 'admin', 'creator')