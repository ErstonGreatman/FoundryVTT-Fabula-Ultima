import { RollableClassFeatureDataModel } from '../class-feature-data-model.mjs';
import { SYSTEM } from '../../../../helpers/config.mjs';
import { Flags } from '../../../../helpers/flags.mjs';

/**
 * @extends ClassFeatureDataModel
 * @property {string} domains
 * @property {string} merge
 * @property {string} pulse
 * @property {string} dismiss
 */
export class ArcanumDataModel extends RollableClassFeatureDataModel {
	static defineSchema() {
		const { StringField, HTMLField } = foundry.data.fields;
		return {
			domains: new StringField(),
			merge: new HTMLField(),
			pulse: new HTMLField(),
			dismiss: new HTMLField(),
		};
	}

	static get template() {
		return 'systems/projectfu/templates/feature/arcanist/feature-arcanum-variant-sheet.hbs';
	}

	static get previewTemplate() {
		return 'systems/projectfu/templates/feature/arcanist/feature-arcanum-variant-preview.hbs';
	}

	static get expandTemplate() {
		return 'systems/projectfu/templates/feature/arcanist/feature-arcanum-variant-description.hbs';
	}

	static get translation() {
		return 'FU.ClassFeatureArcanum';
	}

	static async getAdditionalData(model) {
		// Extract the ID from model.item
		const itemId = model.item?._id;

		// Get the current active arcanum ID
		const actorArcanumId = model.actor?.system.equipped.arcanum || null;

		// Provide any additional data needed for the template rendering
		return {
			enrichedMerge: await TextEditor.enrichHTML(model.merge),
			enrichedDismiss: await TextEditor.enrichHTML(model.dismiss),
			active: itemId === actorArcanumId,
		};
	}

	static async roll(model, item) {
		const actor = model.parent.parent.actor;
		if (!actor) {
			return;
		}
		const data = {
			domains: model.domains,
			merge: await TextEditor.enrichHTML(model.merge),
			pulse: await TextEditor.enrichHTML(model.pulse),
			dismiss: await TextEditor.enrichHTML(model.dismiss),
		};

		const speaker = ChatMessage.implementation.getSpeaker({ actor: actor });
		const chatMessage = {
			speaker,
			flavor: await renderTemplate('systems/projectfu/templates/chat/chat-check-flavor-item.hbs', model.parent.parent),
			content: await renderTemplate('systems/projectfu/templates/feature/arcanist/feature-arcanum-chat-message.hbs', data),
			flags: { [SYSTEM]: { [Flags.ChatMessage.Item]: item } },
		};

		ChatMessage.create(chatMessage);
	}

	transferEffects() {
		return this.item?.isEquipped ?? false;
	}
}
