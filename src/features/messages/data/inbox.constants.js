// src/features/messages/components/inbox/inbox.constants.js
export const USERS = {
	u1: 'Alicja Śliwińska',
	u2: 'Jan Kowalski',
	u3: 'Anna Nowak',
	u4: 'Piotr Zieliński',
	u5: 'Maria Wiśniewska',
	u6: 'Tomasz Nowak',
	u7: 'Katarzyna Lewandowska',
	u8: 'Paweł Kaczmarek',
	u9: 'Ewa Wojciechowska',
}

export const LOGGED_IN_USER_ID = 'u1'

export const DUMMY_CONVERSATIONS = [
	{
		id: 'chat1',
		name: 'Rozmowa z Anną',
		members: ['u1', 'u3'],
		messages: [
			{
				id: 'm1',
				sender: 'u1',
				text: 'Cześć, jak idą badania?',
				timestamp: '2025-07-04T10:01:00.000Z',
				read: true,
				reactions: {},
			},
			{
				id: 'm2',
				sender: 'u3',
				text: 'Już prawie skończone!',
				timestamp: '2025-07-04T10:02:00.000Z',
				read: true,
				reactions: {},
			},
		],
	},
	{
		id: 'chat2',
		name: 'Zespół projektowy',
		members: ['u1', 'u2', 'u6'],
		messages: [
			{
				id: 'm3',
				sender: 'u6',
				text: 'Kto odpowiada za ofertę dla firmy X?',
				timestamp: '2025-07-03T12:15:00.000Z',
				read: false,
				reactions: {},
			},
		],
	},
]
