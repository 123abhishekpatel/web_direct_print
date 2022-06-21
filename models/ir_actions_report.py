from odoo import models, fields

class IrActionsReport(models.Model):
    _inherit = 'ir.actions.report'

    is_print = fields.Boolean()
