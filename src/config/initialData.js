import Permission from '~/models/permissionModel';
import Role from '~/models/roleModel';
import User from '~/models/userModel';
import logger from './logger';

async function initialData() {
	try {
		const countPermissions = await Permission.estimatedDocumentCount();
		if (countPermissions === 0) {
			await Permission.create(
				// Super Admin & Admin permissions
				{
					controller: 'user',
					action: 'manage_users'
				},
				{
					controller: 'contract',
					action: 'manage_contracts'
				},
				{
					controller: 'audit',
					action: 'view_audit_logs'
				},
				{
					controller: 'settings',
					action: 'override_settings'
				},
				{
					controller: 'lawyer',
					action: 'manage_lawyer_approvals'
				},
				{
					controller: 'feature',
					action: 'feature_flag_control'
				},
				{
					controller: 'analytics',
					action: 'access_all_analytics'
				},
				{
					controller: 'template',
					action: 'manage_templates'
				},
				{
					controller: 'analytics',
					action: 'access_analytics'
				},
				{
					controller: 'pricing',
					action: 'control_pricing_and_tokens'
				},
				{
					controller: 'cms',
					action: 'cms_edit_help_articles'
				},
				// User permissions
				{
					controller: 'contract',
					action: 'create_contract'
				},
				{
					controller: 'contract',
					action: 'edit_contract'
				},
				{
					controller: 'ai',
					action: 'use_ai_assistant'
				},
				{
					controller: 'template',
					action: 'access_templates'
				},
				{
					controller: 'clause',
					action: 'insert_clauses'
				},
				{
					controller: 'contract',
					action: 'download_pdf'
				},
				{
					controller: 'contract',
					action: 'sign_contract'
				},
				{
					controller: 'contract',
					action: 'send_to_client'
				},
				{
					controller: 'reminder',
					action: 'manage_reminders'
				},
				{
					controller: 'dashboard',
					action: 'view_dashboard'
				},
				{
					controller: 'token',
					action: 'purchase_tokens'
				},
				// Client Collaborator permissions
				{
					controller: 'contract',
					action: 'view_shared_contract'
				},
				{
					controller: 'contract',
					action: 'comment_on_contract'
				},
				{
					controller: 'contract',
					action: 'suggest_edits'
				},
				// Lawyer permissions
				{
					controller: 'contract',
					action: 'view_shared_contracts'
				},
				{
					controller: 'contract',
					action: 'comment_contracts'
				},
				{
					controller: 'ai',
					action: 'use_ai_editor'
				},
				{
					controller: 'chat',
					action: 'chat_with_users'
				},
				{
					controller: 'consultation',
					action: 'schedule_consultation'
				},
				{
					controller: 'invoice',
					action: 'invoice_clients'
				},
				{
					controller: 'availability',
					action: 'manage_availability'
				},
				// Team Member permissions
				{
					controller: 'contract',
					action: 'view_team_contracts'
				},
				{
					controller: 'contract',
					action: 'comment_contract'
				},
				{
					controller: 'clause',
					action: 'use_clauses'
				}
			);
		}

		const countRoles = await Role.estimatedDocumentCount();
		if (countRoles === 0) {
			// Get all permissions for each role
			const superAdminPermissions = await Permission.find({
				$or: [
					{ controller: 'user', action: 'manage_users' },
					{ controller: 'contract', action: 'manage_contracts' },
					{ controller: 'audit', action: 'view_audit_logs' },
					{ controller: 'settings', action: 'override_settings' },
					{ controller: 'lawyer', action: 'manage_lawyer_approvals' },
					{ controller: 'feature', action: 'feature_flag_control' },
					{ controller: 'analytics', action: 'access_all_analytics' }
				]
			});

			const adminPermissions = await Permission.find({
				$or: [
					{ controller: 'user', action: 'manage_users' },
					{ controller: 'contract', action: 'manage_contracts' },
					{ controller: 'audit', action: 'view_audit_logs' },
					{ controller: 'template', action: 'manage_templates' },
					{ controller: 'analytics', action: 'access_analytics' },
					{ controller: 'pricing', action: 'control_pricing_and_tokens' },
					{ controller: 'cms', action: 'cms_edit_help_articles' }
				]
			});

			const userPermissions = await Permission.find({
				$or: [
					{
						controller: 'contract',
						action: { $in: ['create_contract', 'edit_contract', 'download_pdf', 'sign_contract', 'send_to_client'] }
					},
					{ controller: 'ai', action: 'use_ai_assistant' },
					{ controller: 'template', action: 'access_templates' },
					{ controller: 'clause', action: 'insert_clauses' },
					{ controller: 'reminder', action: 'manage_reminders' },
					{ controller: 'dashboard', action: 'view_dashboard' },
					{ controller: 'token', action: 'purchase_tokens' }
				]
			});

			const clientCollaboratorPermissions = await Permission.find({
				$or: [
					{
						controller: 'contract',
						action: { $in: ['view_shared_contract', 'comment_on_contract', 'suggest_edits', 'sign_contract'] }
					}
				]
			});

			const lawyerPermissions = await Permission.find({
				$or: [
					{ controller: 'contract', action: { $in: ['view_shared_contracts', 'comment_contracts'] } },
					{ controller: 'ai', action: 'use_ai_editor' },
					{ controller: 'chat', action: 'chat_with_users' },
					{ controller: 'consultation', action: 'schedule_consultation' },
					{ controller: 'invoice', action: 'invoice_clients' },
					{ controller: 'availability', action: 'manage_availability' }
				]
			});

			const teamMemberPermissions = await Permission.find({
				$or: [
					{ controller: 'contract', action: { $in: ['view_team_contracts', 'edit_contract', 'comment_contract'] } },
					{ controller: 'clause', action: 'use_clauses' },
					{ controller: 'dashboard', action: 'view_dashboard' }
				]
			});

			await Role.create(
				{
					name: 'Super Admin',
					description: 'Full platform control including all admin features and override capabilities.',
					permissions: superAdminPermissions
				},
				{
					name: 'Admin',
					description: 'Platform moderator with ability to manage users, view analytics, and configure system settings.',
					permissions: adminPermissions
				},
				{
					name: 'User',
					description: 'Standard user who drafts, edits, and manages contracts.',
					permissions: userPermissions
				},
				{
					name: 'Client Collaborator',
					description: 'External party invited to review or sign a contract.',
					permissions: clientCollaboratorPermissions
				},
				{
					name: 'Lawyer',
					description: 'Verified legal expert offering review or consultation.',
					permissions: lawyerPermissions
				},
				{
					name: 'Team Member',
					description: 'Member of a business/legal team with role-based limitations.',
					permissions: teamMemberPermissions
				}
			);
		}

		const countUsers = await User.estimatedDocumentCount();
		if (countUsers === 0) {
			const roleSuperAdmin = await Role.findOne({ name: 'Super Admin' });
			const roleAdmin = await Role.findOne({ name: 'Admin' });
			const roleUser = await Role.findOne({ name: 'User' });
			const roleLawyer = await Role.findOne({ name: 'Lawyer' });
			const roleTeamMember = await Role.findOne({ name: 'Team Member' });

			await User.create(
				{
					firstName: 'Super',
					lastName: 'Admin',
					userName: 'superadmin',
					email: 'superadmin@lexidraft.com',
					password: 'superadmin123',
					roles: [roleSuperAdmin]
				},
				{
					firstName: 'Admin',
					lastName: 'User',
					userName: 'admin',
					email: 'admin@lexidraft.com',
					password: 'admin123',
					roles: [roleAdmin]
				},
				{
					firstName: 'John',
					lastName: 'Doe',
					userName: 'johndoe',
					email: 'john.doe@example.com',
					password: 'user123',
					roles: [roleUser]
				},
				{
					firstName: 'Sarah',
					lastName: 'Wilson',
					userName: 'swilson',
					email: 'sarah.wilson@lawfirm.com',
					password: 'lawyer123',
					roles: [roleLawyer]
				},
				{
					firstName: 'Michael',
					lastName: 'Brown',
					userName: 'mbrown',
					email: 'michael.brown@company.com',
					password: 'team123',
					roles: [roleTeamMember]
				}
			);
		}
	} catch (err) {
		logger.error(err);
	}
}

export default initialData;
