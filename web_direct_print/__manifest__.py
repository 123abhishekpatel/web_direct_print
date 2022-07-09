{
    'name': 'Web Direct Print',
    "version": '1.1.0',
    'category': 'Other',
    'author': 'CustomizeApps',
    'summary': '',
    'description': ''' ''',
    'depends': ['base'],
    'data': ['views/ir_actions_report.xml'],
    'images': ['static/description/banner.gif'],
    'license': 'OPL-1',
    'application': False,
    'installable': True,
    'auto_install': False,
    'assets': {
        'web.assets_backend': [
            'web_direct_print/static/src/js/ajax.js',
        ],
    },
}
