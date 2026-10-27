#!/usr/bin/env python3
"""Genera templates/product.json e index.json del tema Lumielle con el copy de la landing.
Mantener el copy aquí evita errores de JSON al editar textos largos. Uso: python3 lumielle/tools/build-templates.py"""
import json, os

THEME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'theme')
IMG = 'shopify://shop_images/'

def blocks(*items):
    out, order = {}, []
    for i, (btype, settings, *rest) in enumerate(items, 1):
        bid = f'{btype.replace("_", "-")}-{i}'
        out[bid] = {'type': btype, 'settings': settings}
        if rest and rest[0] == 'disabled':
            out[bid]['disabled'] = True
        order.append(bid)
    return out, order

def section(stype, settings=None, block_list=None, disabled=False):
    s = {'type': stype, 'settings': settings or {}}
    if block_list:
        s['blocks'], s['block_order'] = blocks(*block_list)
    if disabled:
        s['disabled'] = True
    return s

BUY_BOX = [
    ('text', {'text': 'Retinol + Colágeno + Ácido hialurónico', 'style': 'eyebrow'}),
    ('title', {}),
    ('rating', {}),
    ('text', {'text': 'Tu rutina antiedad completa en una sola crema: <strong>piel más hidratada, suave y de aspecto más firme</strong> en rostro y cuello.', 'style': 'subtitle'}),
    ('price', {'note': 'Envío gratis incluido'}),
    ('bullets', {
        'item_1': '<strong>Hidratación profunda:</strong> el ácido hialurónico retiene agua y deja tu piel suave desde la primera aplicación.',
        'item_2': '<strong>Suaviza visiblemente los signos de la edad</strong> con retinol, el clásico de las rutinas antiedad.',
        'item_3': '<strong>Aspecto más firme:</strong> el colágeno contribuye a mejorar la firmeza visible de rostro y cuello.',
        'item_4': '<strong>110 ml:</strong> casi 4 veces el contenido de un sérum típico de 30 ml.',
    }),
    ('variant_picker', {'pack_heading': 'Elige tu pack', 'note_1': '1 tubo de 110 ml', 'note_2': 'La 2.ª unidad al 50 %', 'note_3': 'Lleva 3 y paga 2'}),
    ('buy_buttons', {'note': 'Sin pagos por adelantado: pagas cuando lo recibes'}),
    ('delivery', {'text': 'Pide hoy y recíbelo entre el <strong>{min}</strong> y el <strong>{max}</strong>', 'fallback': 'Recíbelo en 2 a 5 días hábiles'}),
    ('trust_icons', {'icon_1': 'truck', 'text_1': 'Envío gratis a toda Colombia', 'icon_2': 'cash', 'text_2': 'Pagas en efectivo al recibir', 'icon_3': 'shield', 'text_3': 'Garantía de 30 días'}),
    ('payment', {'cod_text': '<strong>Pago contra entrega:</strong> te confirmamos por WhatsApp y pagas en efectivo cuando llega tu pedido.'}),
    ('accordion', {'heading': 'Cómo se usa', 'icon': 'hand', 'open': False,
                   'content': '<p>Úsala en la noche sobre el rostro y el cuello limpios y secos. Aplica una pequeña cantidad con movimientos ascendentes, evitando el contorno de ojos y los labios.</p><p>Si es tu primera vez con retinol, haz una prueba en una zona pequeña 24 horas antes y empieza 3 noches por semana. En el día, usa siempre protector solar.</p>'}),
    ('accordion', {'heading': 'Ingredientes clave', 'icon': 'drop', 'open': False,
                   'content': '<p><strong>Retinol:</strong> suaviza visiblemente las líneas finas y mejora la textura con el uso constante.</p><p><strong>Colágeno:</strong> ayuda a retener la hidratación y contribuye a mejorar el aspecto de firmeza.</p><p><strong>Ácido hialurónico:</strong> hidrata en profundidad y deja la piel suave.</p><p>Contenido: 110 ml. Lista completa de ingredientes (INCI) en el empaque.</p>'}),
    ('accordion', {'heading': 'Envío y pago contra entrega', 'icon': 'truck', 'open': False,
                   'content': '<p>Envío gratis a toda Colombia. Despachamos en 1 día hábil y la entrega tarda de 2 a 5 días hábiles según tu ciudad.</p><p>Pagas en efectivo cuando recibes. Antes de despachar te confirmamos el pedido por WhatsApp.</p>'}),
    ('accordion', {'heading': 'Garantía y devoluciones', 'icon': 'shield', 'open': False,
                   'content': '<p>Tienes 30 días desde que recibes tu pedido: si no te encanta, escríbenos por WhatsApp y te devolvemos tu dinero.</p><p>Además, puedes ejercer tu derecho de retracto dentro de los 5 días hábiles siguientes a la entrega (Ley 1480 de 2011).</p>'}),
]

MAIN_SETTINGS = {'scheme': 'white', 'media_ratio': 'square', 'show_thumbnails': True, 'pack_option_name': 'Cantidad',
                 'popular_position': 2, 'popular_badge': 'Más popular', 'preselect_popular': True,
                 'best_position': 3, 'best_badge': 'Mejor precio'}

MARQUEE = section('lp-marquee', {'scheme': 'ink', 'duration': 35}, [
    ('item', {'text': t}) for t in ['Hidratación profunda', 'Retinol', 'Colágeno', 'Ácido hialurónico', 'Envío gratis', 'Paga al recibir', 'Garantía de 30 días']])

PROBLEM = section('lp-problem', {
    'scheme': 'alt', 'eyebrow': '¿Te pasa esto?', 'heading': 'Tu piel cambió, pero tu rutina sigue igual', 'intro': '',
    'closing': '<p>Armar una rutina antiedad completa suele significar <strong>tres productos distintos</strong>: un sérum de retinol, otro de ácido hialurónico y una crema reafirmante. Es caro, son muchos pasos y casi nadie la cumple todos los días.</p>'}, [
    ('pain', {'icon': 'droplets', 'title': 'Piel tirante y opaca', 'text': 'Aunque te hidrates, a media tarde la sientes seca y sin luz.'}),
    ('pain', {'icon': 'face', 'title': 'Líneas finas más visibles', 'text': 'Se notan más cada mes, sobre todo alrededor de los ojos y al maquillarte.'}),
    ('pain', {'icon': 'firm', 'title': 'Rostro y cuello menos firmes', 'text': 'El contorno ya no se ve como antes y no sabes por dónde empezar.'}),
])

INFOGRAPHIC = section('lp-infographic', {
    'scheme': 'white', 'eyebrow': 'La solución', 'heading': '3 activos antiedad, <em>1 solo paso</em>',
    'text': 'Lo que normalmente compras en tres frascos, en una sola crema para rostro y cuello.',
    'image': IMG + 'lumielle-activos.jpg', 'note': 'Lista completa de ingredientes (INCI) en el empaque.'}, [
    ('callout', {'tag': 'Hidrata', 'title': 'Ácido hialurónico', 'text': 'Atrae y retiene agua en la piel: la deja suave y elástica desde la primera aplicación.'}),
    ('callout', {'tag': 'Renueva', 'title': 'Retinol', 'text': 'El clásico de las rutinas antiedad: suaviza visiblemente las líneas finas y mejora la textura con el uso constante.'}),
    ('callout', {'tag': 'Reafirma', 'title': 'Colágeno', 'text': 'Ayuda a retener la hidratación y contribuye a mejorar el aspecto de firmeza de la piel.'}),
])

BENEFITS = section('lp-benefits', {
    'scheme': 'tint', 'eyebrow': 'Lo que vas a notar', 'heading': 'Una crema, todo lo que tu piel te está pidiendo', 'text': '',
    'show_cta': True, 'cta_label': 'Quiero mi crema'}, [
    ('benefit', {'icon': 'drop', 'title': 'Hidratación profunda', 'text': 'Tu piel se siente cómoda y nutrida todo el día.'}),
    ('benefit', {'icon': 'feather', 'title': 'Suave desde la primera vez', 'text': 'Textura en crema que se absorbe sin dejar sensación grasosa.'}),
    ('benefit', {'icon': 'sparkle', 'title': 'Signos de la edad más suaves', 'text': 'Con el uso constante, las líneas finas se ven visiblemente más suaves.'}),
    ('benefit', {'icon': 'firm', 'title': 'Aspecto más firme', 'text': 'Contribuye a mejorar el aspecto de firmeza en rostro y cuello.'}),
    ('benefit', {'icon': 'layers', 'title': '1 paso en vez de 3', 'text': 'Retinol, colágeno y ácido hialurónico en la misma fórmula.'}),
    ('benefit', {'icon': 'tube', 'title': '110 ml que rinden', 'text': 'Casi 4 veces el contenido de un sérum típico de 30 ml.'}),
])

STEPS = section('lp-how-it-works', {
    'scheme': 'white', 'eyebrow': 'Cómo se usa', 'heading': 'Tu rutina de noche en 3 pasos', 'text': '',
    'tip': '<strong>¿Primera vez con retinol?</strong> Haz una prueba en una zona pequeña 24 horas antes y empieza 3 noches por semana.'}, [
    ('step', {'title': 'Limpia', 'text': 'Lava tu rostro y cuello y sécalos con suaves toques.'}),
    ('step', {'title': 'Aplica', 'text': 'Esparce una pequeña cantidad en rostro y cuello con movimientos ascendentes, evitando el contorno de ojos.'}),
    ('step', {'title': 'Protege', 'text': 'Úsala en la noche. En la mañana aplica protector solar: con retinol tu piel lo necesita más.'}),
])

UGC = section('lp-video-ugc', {'scheme': 'alt', 'eyebrow': 'En la vida real', 'heading': 'Mira la textura y cómo se aplica', 'text': ''}, disabled=True)

COMPARISON = section('lp-comparison', {
    'scheme': 'alt', 'eyebrow': 'Haz la cuenta', 'heading': 'Una crema completa vs. armar la rutina por separado', 'text': '',
    'us_image': IMG + 'lumielle-pack-1.jpg', 'us_label': 'Crema Serum 10', 'them_label': 'Productos por separado', 'note': ''}, [
    ('row', {'label': 'Retinol, colágeno y ácido hialurónico en una fórmula', 'us': 'yes', 'us_text': '', 'them': 'no', 'them_text': ''}),
    ('row', {'label': 'Pasos en tu rutina', 'us': 'text', 'us_text': '1', 'them': 'text', 'them_text': '3 o más'}),
    ('row', {'label': 'Contenido', 'us': 'text', 'us_text': '110 ml', 'them': 'text', 'them_text': '30 ml por frasco (típico)'}),
    ('row', {'label': 'Para rostro y cuello', 'us': 'yes', 'us_text': '', 'them': 'text', 'them_text': 'Depende del producto'}),
    ('row', {'label': 'Pagas al recibir y envío gratis', 'us': 'yes', 'us_text': '', 'them': 'text', 'them_text': 'Depende de la tienda'}),
    ('row', {'label': 'Garantía de satisfacción de 30 días', 'us': 'yes', 'us_text': '', 'them': 'no', 'them_text': ''}),
])

REVIEWS = section('lp-reviews', {'scheme': 'white', 'eyebrow': 'Opiniones', 'heading': 'Lo que dicen nuestras clientas', 'text': ''}, disabled=True)

OFFER = section('lp-offer', {
    'scheme': 'tint', 'eyebrow': 'Elige tu pack', 'heading': 'Entre más llevas, más ahorras',
    'text': 'Envío gratis a toda Colombia y pagas en efectivo cuando recibes.', 'pack_option_name': 'Cantidad',
    'popular_position': 2, 'popular_badge': 'Más popular', 'button_label': 'Elegir este pack',
    'image_1': IMG + 'lumielle-pack-1.jpg', 'note_1': 'Para empezar tu rutina',
    'image_2': IMG + 'lumielle-pack-2.jpg', 'note_2': 'La 2.ª unidad al 50 %',
    'image_3': IMG + 'lumielle-pack-3.jpg', 'note_3': 'Lleva 3 y paga 2: para ti y para regalar',
    'note_4': '', 'footer': 'Garantía de satisfacción de 30 días en todos los packs'})

GUARANTEE = section('lp-guarantee', {
    'scheme': 'white', 'days': '30', 'unit': 'días', 'eyebrow': 'Compra sin riesgo', 'heading': 'Si no te encanta, te devolvemos tu dinero',
    'text': '<p>Pruébala hasta 30 días después de recibirla. Si no estás feliz con el resultado, escríbenos por WhatsApp con tu número de pedido y te devolvemos el 100 % de lo que pagaste por Nequi, Daviplata o transferencia. Sin letra pequeña.</p>',
    'link': '/policies/refund-policy', 'link_label': 'Ver política de garantía y devoluciones'})

FAQ_ITEMS = [
    ('¿Cómo funciona el pago contra entrega?', '<p>Haces tu pedido sin pagar nada en línea. Te escribimos por WhatsApp para confirmar tus datos y pagas en efectivo cuando el producto llega a tu casa.</p>'),
    ('¿Cuánto tarda en llegar y cuánto cuesta el envío?', '<p>El envío es gratis a toda Colombia. Despachamos en 1 día hábil y la entrega tarda de 2 a 5 días hábiles según tu ciudad.</p>'),
    ('¿En cuánto tiempo veo resultados?', '<p>La hidratación y la suavidad se sienten desde la primera aplicación. Como con toda crema con retinol, el cambio en líneas finas y firmeza es gradual: dale al menos 8 semanas de uso constante. Los resultados pueden variar según cada piel.</p>'),
    ('¿Sirve para piel sensible?', '<p>Sí, con precaución. El retinol puede causar enrojecimiento o descamación leve los primeros días. Haz una prueba en una zona pequeña 24 horas antes, empieza 3 noches por semana y suspende el uso si hay irritación persistente.</p>'),
    ('¿Puedo usarla de día?', '<p>Recomendamos usarla en la noche. Si la aplicas de día, usa siempre protector solar encima: el retinol hace que tu piel sea más sensible al sol.</p>'),
    ('¿La puedo usar si estoy embarazada o lactando?', '<p>Contiene retinol, así que si estás embarazada, buscas embarazo o estás lactando, consulta con tu médico antes de usarla.</p>'),
    ('¿Cuánto me dura un tubo?', '<p>Usándola una vez al día en rostro y cuello, un tubo de 110 ml rinde aproximadamente de 2 a 3 meses.</p>'),
    ('¿Y si no me gusta?', '<p>Tienes 30 días de garantía: escríbenos por WhatsApp con tu número de pedido y te devolvemos tu dinero. También puedes ejercer tu derecho de retracto dentro de los 5 días hábiles siguientes a la entrega.</p>'),
]
FAQ = section('lp-faq', {'scheme': 'white', 'eyebrow': 'Preguntas frecuentes', 'heading': 'Resolvemos tus dudas', 'text': '',
                         'more_text': '¿Tienes otra pregunta?', 'wa_label': 'Escríbenos por WhatsApp'},
              [('question', {'question': q, 'answer': a}) for q, a in FAQ_ITEMS])

CROSS = section('lp-cross-sell', {'scheme': 'white', 'eyebrow': 'Combínala con', 'heading': 'Completa tu rutina'}, disabled=True)

FINAL = section('lp-final-cta', {
    'scheme': 'brand', 'image': IMG + 'lumielle-final.jpg', 'eyebrow': 'Tu piel lo va a notar',
    'heading': 'Tu rutina antiedad completa, en un solo paso', 'text': 'Pide hoy, recíbela en casa y paga en efectivo al recibir.',
    'button_label': 'Pedir ahora – Paga al recibir', 'trust_1': 'Envío gratis a toda Colombia', 'trust_2': 'Pagas al recibir', 'trust_3': '30 días de garantía'})

STICKY = section('lp-sticky-atc', {'label': 'Pedir ahora'})

product = {
    'sections': {
        'main': section('main-product', MAIN_SETTINGS, BUY_BOX),
        'sticky': STICKY, 'marquee': MARQUEE, 'problem': PROBLEM, 'infographic': INFOGRAPHIC, 'benefits': BENEFITS,
        'steps': STEPS, 'ugc': UGC, 'comparison': COMPARISON, 'reviews': REVIEWS, 'offer': OFFER, 'guarantee': GUARANTEE,
        'faq': FAQ, 'cross_sell': CROSS, 'final_cta': FINAL,
    },
    'order': ['main', 'sticky', 'marquee', 'problem', 'infographic', 'benefits', 'steps', 'ugc', 'comparison', 'reviews',
              'offer', 'guarantee', 'faq', 'cross_sell', 'final_cta'],
}

HOME_BUY_BOX = [b for b in BUY_BOX if b[0] not in ('accordion', 'payment')]
# En el inicio se rotan las imágenes para no repetir la misma foto en secciones seguidas.
HOME_INFOGRAPHIC = dict(INFOGRAPHIC, settings=dict(INFOGRAPHIC['settings'], image=IMG + 'lumielle-final.jpg'))
HOME_FINAL = dict(FINAL, settings=dict(FINAL['settings'], image=IMG + 'lumielle-pack-2.jpg'))
index = {
    'sections': {
        'hero': section('lp-hero', {
            'scheme': 'alt', 'image': IMG + 'lumielle-activos.jpg', 'eyebrow': 'Retinol + Colágeno + Ácido hialurónico',
            'heading': 'Tu rutina antiedad completa, en una sola crema',
            'text': 'Hidratación profunda, piel más suave y un aspecto más firme en rostro y cuello. Pide hoy y paga al recibir.',
            'button_label': 'Ver la crema', 'link': '/products/crema-facial-serum-10',
            'trust_1': 'Envío gratis', 'trust_2': 'Paga al recibir', 'trust_3': '30 días de garantía'}),
        'trust': section('lp-trust-bar', {'scheme': 'white'}, [
            ('item', {'icon': 'truck', 'title': 'Envío gratis', 'text': 'A toda Colombia'}),
            ('item', {'icon': 'cash', 'title': 'Paga al recibir', 'text': 'En efectivo, sin tarjeta'}),
            ('item', {'icon': 'shield', 'title': 'Garantía de 30 días', 'text': 'O te devolvemos tu dinero'}),
            ('item', {'icon': 'chat', 'title': 'Atención por WhatsApp', 'text': 'Te acompañamos en tu pedido'}),
        ]),
        'featured': section('main-product', dict(MAIN_SETTINGS, scheme='white'), HOME_BUY_BOX),
        'sticky': STICKY, 'marquee': MARQUEE, 'problem': PROBLEM, 'infographic': HOME_INFOGRAPHIC, 'benefits': BENEFITS,
        'comparison': COMPARISON, 'offer': OFFER, 'guarantee': GUARANTEE, 'faq': FAQ, 'final_cta': HOME_FINAL,
    },
    'order': ['hero', 'trust', 'featured', 'sticky', 'marquee', 'problem', 'infographic', 'benefits', 'comparison', 'offer',
              'guarantee', 'faq', 'final_cta'],
}

for name, data in (('product', product), ('index', index)):
    with open(os.path.join(THEME, 'templates', f'{name}.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('✓ templates/%s.json' % name)
