# Acapulco demo apps (26) ✝

Built Oct 31 2026. One app per restaurant/café, opened from Rutas → ✨ Ver su app demo.
Link pattern: https://go.myjefetech.app/acapulco/demo/?id=<id>

Each has its own menu, 5 AI photos (cover + 4 signature dishes), WiFi button (sample network until sold), orders to Brian's WhatsApp.

Menu source: real = their published menu and prices · partial = real dishes, some prices estimated · sample = nothing online, menu invented.

| Place | id | Menu |
|---|---|---|
| Buzos Costera | v-NiJBks | partial |
| Jumil Café y Cocina | BxbTqFF0 | sample |
| El Amigo Miguel | dYfMznSc | real |
| Punto 55 | 7HyHo9q0 | real |
| Emilia Café | 4w1_MDvw | real |
| Café al Mar | rswgt_uo | partial |
| Antigua Acapulco | iblARx4g | real |
| Terraza Buffet | qA2KOq8I | partial |
| Narciso | NNNPUPd4 | sample |
| Don Camarón | FcpbDXFk | partial |
| La Casa del Mar | aTeeDAB4 | partial |
| Celeste Beach House | NC6TYDe4 | partial |
| Mary de Revolcadero | bVsCQkbE | sample |
| Mariscos El Sirenito | 5pUK-bVI | partial |
| Paititi del Mar | fJj-Ug_o | partial |
| Café Acapulco Caféba | JMY3GMzM | sample |
| Zabesu Barra Vieja | __eQuxs8 | sample |
| Cira La Morena 1 | dE3m8bK4 | partial |
| Mariscos Catamarán | 0e4m4HMk | sample |
| The Cauldron Wizard's Coffee | 66cxVA6Y | sample |
| La Casa de los Abuelos | Jlg2pi-E | partial |
| Café Wadi | uJ4Hteq8 | partial |
| Restaurant El Tío Markos | zsIVGnis | partial |
| ALTAMAR restaurante y jardín | muOGnk2A | sample |
| Tres Marías Restaurante | JfpbSzOw | partial |
| La Choza de la Freed | kKSUWH7I | sample |

## Going live when one buys (activation flow)
1. Owner taps the gold **✅ Activa tu app** banner in their demo and fills: name, business WhatsApp, exact WiFi name + password, story (optional), menu changes (optional). It sends a WhatsApp to Brian starting "✅ ACTIVAR APP · MX Studio ✝" with the demo ID.
2. Brian pastes that message to Claude. Claude: translates the story ES/EN, applies menu changes, runs `print/acapulco/source/apps/activate.py setup.json`, pushes to GitHub.
3. Result: live app at go.myjefetech.app/acapulco/c/<slug>/ (no demo badge, orders to their WhatsApp, their WiFi, "Nuestra historia" section) + printable 5x7 card in print/acapulco/clientes/<slug>/ (Card-5x7.pdf with bleed, Card-2-por-hoja-CARTA-Letter.pdf, front/back PNG). Front: cover photo, name, one QR to the app (scan-tested automatically). Back: name, story in Spanish and English, address, hours.
Tools and data kept in git: print/acapulco/source/apps/ (gen_apps.py, activate.py, cardtpl/, menus/, apps.json).

Notes: Tres Marías address may be a different same-name restaurant. Terraza Buffet items show 'Incluido en el buffet'. The Cauldron menu is themed but avoids franchise names.
