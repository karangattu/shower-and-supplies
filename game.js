const byId = (id) => document.getElementById(id);
const ITEM_TYPES = {
    shirts: { name: 'Shirt', art: 'shirt' },
    pants: { name: 'Pants', art: 'pants' },
    jackets: { name: 'Jacket', art: 'jacket' },
    toothbrush: { name: 'Toothbrush', art: 'toothbrush' },
    shoes: { name: 'Shoes', art: 'shoes' },
    razor: { name: 'Razor', art: 'razor' },
    sleepingBags: { name: 'Sleeping bag', art: 'sleeping-bag' }
};
const DAILY_EVENTS = [
    { art: 'calm-day', text: 'A calm, quiet day. Get the stations ready for your guests.' },
    { art: 'rainy-day', text: 'Rainy day rush. Guests arrive faster and more of them need laundry.', arrivalSpeed: 1.5, laundryChance: 1.3 },
    { art: 'volunteers', text: 'Extra volunteers are on hand. Cleaning takes half the time.', cleaningSpeed: 2 },
    { art: 'water-heater', text: 'The water heater is running slowly. Showers take longer.', showerSpeed: 0.7 },
    { art: 'jacket', text: 'A cold front is moving in. Earn 30 extra points for each jacket you give out.', jacketBonus: 30 },
    { art: 'delivery', text: 'A delivery is delayed. Today’s donations won’t include sleeping bags.', shortage: 'sleepingBags' },
    { art: 'hot-day', text: 'It’s a hot day. Guests have less time to wait.', patience: 0.75 },
    { art: 'laundry', text: 'Word got out about free laundry. More guests need a wash.', laundryChance: 2 },
    { art: 'tools', text: 'The laundry machines need maintenance. Cycles take longer.', laundrySpeed: 0.6 }
];
const GUEST_PROFILES = [
    { name: 'Maya', portrait: 'guest-welcome' },
    { name: 'Rosa', portrait: 'guest-rosa', supplies: ['jackets'] },
    { name: 'Dante', portrait: 'guest-dante', supplies: ['razor'], suppliesOnly: true },
    { name: 'Eli', portrait: 'guest-beanie' },
    { name: 'Samira', portrait: 'guest-samira', supplies: ['pants'], laundryChance: 0.6 },
    { name: 'Noah', portrait: 'guest-noah', supplies: ['toothbrush'] },
    { name: 'Teresa', portrait: 'guest-teresa', supplies: ['sleepingBags'], suppliesOnly: true },
    { name: 'Lin', portrait: 'guest-glasses' },
    { name: 'Julián', portrait: 'guest-julian', supplies: ['shoes'] },
    { name: 'Nico', portrait: 'guest-nico', supplies: ['shirts'], laundryChance: 0.6 },
    { name: 'Marisol', portrait: 'guest-marisol', supplies: ['shirts', 'pants'] }
];
const SERVICE_INFO = {
    shower: { label: 'Needs a shower', action: 'Start shower', unavailable: 'Waiting for a stall', busy: 'Showering' },
    washer: { label: 'Needs a wash', action: 'Start wash', unavailable: 'Waiting for washer', busy: 'Washing' },
    dryer: { label: 'Ready to dry', action: 'Move to dryer', unavailable: 'Waiting for dryer', busy: 'Drying' }
};
const MAX_GUESTS_LEFT = 5;
const VOLUNTEER_COST = 50;
const API = 'https://script.google.com/macros/s/AKfycbzkQztKIezgMgpjqRBAyFstUFmkctO_cV2KYpulTEw-vCM3C_OgBqp0OBmMvbALkrln/exec';
const help = byId('help-modal');
const leaderboard = byId('leaderboard-modal');
const gameOver = byId('game-over-modal');
const guestQueue = byId('guest-queue');
const dropArea = byId('supply-drop-area');
const bins = byId('supply-bins');
const donate = byId('accept-supply-drop');
const volunteer = byId('volunteer-callout-btn');
const volunteerStill = byId('volunteer-still');
const volunteerSprite = byId('volunteer-sprite');
const scoreForm = byId('score-form');
let game;
let clock;
let messageTimer;
let dragged;

function art(name, size) {
    return `<img src="assets/${name}.webp" width="${size}" height="${size}" alt="" draggable="false">`;
}

function analytics(name, data) {
    if (typeof gtag === 'function') gtag('event', name, data);
}

function announce(message) {
    const status = byId('game-message');
    status.textContent = message;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { status.textContent = ''; }, 3200);
}

function playSound(success) {
    if (navigator.vibrate) navigator.vibrate(success ? 15 : [25, 30, 25]);
    const preview = success ? '654/654321_12315704' : '672/672085_14040168';
    const audio = new Audio(`https://cdn.freesound.org/previews/${preview}-lq.mp3`);
    audio.volume = 0.2;
    audio.play().catch(() => {});
}

function difficulty() {
    return Math.floor(game.served / 7);
}

function startGame() {
    gameOver.close();
    game = {
        score: 0, served: 0, guestsLeft: 0, stress: 0, time: 0, nextGuestAt: 1000, nextDropAt: 0,
        nextGuestId: 1, nextSupplyId: 1, volunteersUntil: 0,
        selectedGuest: null, selectedSupply: null, guests: new Map(), supplies: new Map(),
        inventory: { shirts: 2, pants: 2, jackets: 1, toothbrush: 2, shoes: 2, razor: 1, sleepingBags: 1 },
        event: DAILY_EVENTS[Math.floor(Math.random() * DAILY_EVENTS.length)],
        equipment: [
            { id: 'shower-0', type: 'shower', name: 'Stall 1', state: 'available' },
            { id: 'shower-1', type: 'shower', name: 'Stall 2', state: 'available' },
            { id: 'washer', type: 'washer', name: 'Washer', state: 'available' },
            { id: 'dryer', type: 'dryer', name: 'Dryer', state: 'available' }
        ]
    };
    dragged = null;
    clearTimeout(messageTimer);
    byId('game-message').textContent = '';
    byId('daily-event-text').textContent = game.event.text;
    byId('daily-event-art').src = `assets/${game.event.art}.webp`;
    byId('welcome').hidden = true;
    byId('shift').hidden = false;
    byId('help-btn').hidden = false;
    guestQueue.replaceChildren();
    dropArea.replaceChildren();
    renderEquipment();
    renderGuests();
    renderSupplies();
    updateStats();
    byId('shift-title').focus({ preventScroll: true });
    window.scrollTo(0, 0);
    clearInterval(clock);
    let lastTick = performance.now();
    clock = setInterval(() => {
        const now = performance.now();
        const elapsed = Math.min(now - lastTick, 250);
        lastTick = now;
        if (!help.open && !leaderboard.open && !document.hidden) tick(elapsed);
    }, 100);
    analytics('game_start');
}

function tick(elapsed) {
    game.time += elapsed;
    const helpers = game.time < game.volunteersUntil;
    const waiting = [...game.guests.values()].filter(guest => guest.state !== 'in-service');
    const dirty = game.equipment.filter(unit => unit.state === 'dirty');
    const change = waiting.filter(guest => guest.state !== 'dryer').length * 0.05 +
        dirty.filter(unit => unit.type === 'shower').length * 0.1 +
        dirty.filter(unit => unit.type !== 'shower').length * 0.08 + game.supplies.size * 0.03;
    game.stress = Math.max(0, game.stress + (change * (helpers ? 0.3 : 1) - 0.04) * elapsed / 100);

    for (const guest of waiting) {
        const rate = guest.state === 'requesting' || guest.state === 'dryer' ? 1.5 : 1;
        guest.waitLeft -= elapsed * rate * (helpers ? 0.5 : 1);
        if (guest.waitLeft <= 0) {
            game.guests.delete(guest.id);
            if (game.selectedGuest === guest.id) game.selectedGuest = null;
            game.guestsLeft++;
            game.stress += 15;
            analytics('guest_upset');
            renderGuests();
            updateEquipmentTargets();
        } else {
            const meter = byId(guest.id).querySelector('progress');
            meter.value = guest.waitLeft / guest.waitMax * 100;
            meter.dataset.level = meter.value < 40 ? 'low' : meter.value < 75 ? 'medium' : 'high';
        }
    }

    updateStats();
    if (game.guestsLeft >= MAX_GUESTS_LEFT || game.stress >= 100) {
        endGame(game.guestsLeft >= MAX_GUESTS_LEFT
            ? 'Five guests left after waiting too long.'
            : 'The shift ended because stress reached 100%.');
        return;
    }

    for (const unit of game.equipment) {
        if (!unit.endsAt) continue;
        const meter = byId(unit.id).querySelector('progress');
        meter.value = 100 * (game.time - unit.startedAt) / (unit.endsAt - unit.startedAt);
        if (game.time >= unit.endsAt) finishEquipment(unit);
    }

    if (game.time >= game.nextGuestAt) spawnGuest();
}

function spawnGuest() {
    const number = game.nextGuestId;
    const profile = GUEST_PROFILES[(number - 1) % GUEST_PROFILES.length];
    const active = [...game.guests.values()].filter(guest => guest.state !== 'requesting' && guest.state !== 'dryer');
    if (!profile.suppliesOnly && active.length >= 5) {
        game.nextGuestAt = game.time + 1500;
        return;
    }
    game.nextGuestId++;
    const guest = { id: `guest-${number}`, profile };
    if (profile.suppliesOnly) {
        requestSupplies(guest);
    } else {
        const laundryChance = (profile.laundryChance ?? 0.2) * (game.event.laundryChance ?? 1);
        guest.state = Math.random() < laundryChance ? 'washer' : 'shower';
    }
    resetWait(guest);
    game.guests.set(guest.id, guest);
    const arrival = (3750 + 1500 * Math.random()) * Math.max(0.3, 1 - 0.07 * difficulty());
    game.nextGuestAt = game.time + arrival / (game.event.arrivalSpeed ?? 1) * (game.served >= 6 ? 1.3 : 1);
    renderGuests();
}

function requestSupplies(guest) {
    guest.state = 'requesting';
    if (guest.profile.supplies) {
        guest.requests = new Set(guest.profile.supplies);
        return;
    }

    const types = Object.keys(ITEM_TYPES);
    const count = Math.random() < Math.min(0.8, 0.2 + 0.08 * difficulty()) ? 2 : 1;
    guest.requests = new Set(Array.from({ length: count }, () => types[Math.floor(Math.random() * types.length)]));
}

function resetWait(guest) {
    guest.waitMax = 30000 * Math.max(0.5, 1 - 0.07 * difficulty()) * (game.event.patience ?? 1);
    guest.waitLeft = guest.waitMax;
}

function startService(guestId, unit) {
    const guest = game.guests.get(guestId);
    if (!guest || !unit || unit.state !== 'available' || guest.state !== unit.type) return;
    game.selectedGuest = null;
    guest.state = 'in-service';
    unit.guestId = guest.id;
    const base = { shower: 10000, washer: 12000, dryer: 8000 }[unit.type];
    const speed = unit.type === 'shower' ? game.event.showerSpeed : game.event.laundrySpeed;
    startEquipment(unit, 'occupied', base * (1 + 0.06 * difficulty()) / (speed ?? 1));
    announce(`${guest.profile.name} is using the ${unit.name.toLowerCase()}.`);
    playSound(true);
    if (unit.type === 'shower') analytics('assign_guest_to_shower');
    else analytics('assign_guest_to_laundry', { machine: unit.type === 'washer' ? 'wash' : 'dry' });
}

function startEquipment(unit, state, duration) {
    unit.state = state;
    unit.startedAt = game.time;
    unit.endsAt = game.time + duration;
    renderUnit(unit);
    renderGuests();
    updateEquipmentTargets();
}

function finishEquipment(unit) {
    unit.endsAt = 0;
    if (unit.state === 'cleaning') {
        unit.state = 'available';
    } else {
        const guest = game.guests.get(unit.guestId);
        unit.guestId = null;
        unit.state = 'dirty';
        resetWait(guest);
        if (unit.type === 'washer') {
            guest.state = 'dryer';
        } else {
            requestSupplies(guest);
            game.score += unit.type === 'shower' ? 50 : 75;
        }
    }
    renderUnit(unit);
    renderGuests();
    updateEquipmentTargets();
    updateStats();
}

function clean(unit) {
    const base = 6000 * (1 + 0.06 * difficulty()) / (game.event.cleaningSpeed ?? 1);
    startEquipment(unit, 'cleaning', base * (game.time < game.volunteersUntil ? 0.3 : 1));
    analytics(unit.type === 'shower' ? 'clean_shower' : 'clean_laundry');
}

function acceptDonations() {
    if (game.time < game.nextDropAt) return;
    const types = Object.keys(ITEM_TYPES).filter(type => type !== game.event.shortage);
    for (let index = 0; index < 4; index++) {
        game.supplies.set(`supply-${game.nextSupplyId++}`, types[Math.floor(Math.random() * types.length)]);
    }
    game.nextDropAt = game.time + 3000;
    renderSupplies();
    updateStats();
    dropArea.querySelector('button').focus({ preventScroll: true });
}

function sortSupply(id, binType) {
    const type = game.supplies.get(id);
    if (!type) return;
    if (type !== binType) {
        game.stress = Math.min(100, game.stress + 5);
        announce(`That donation belongs in the ${ITEM_TYPES[type].name.toLowerCase()} bin.`);
        playSound(false);
        analytics('sort_supply', { result: 'incorrect', type });
        return;
    }
    game.inventory[type]++;
    game.score += 15;
    game.supplies.delete(id);
    if (game.selectedSupply === id) game.selectedSupply = null;
    renderSupplies();
    renderGuests();
    updateStats();
    playSound(true);
    announce(`${ITEM_TYPES[type].name} added to stock. 15 points earned.`);
    analytics('sort_supply', { result: 'correct', type });
}

function fulfillRequest(guest, type) {
    if (!guest.requests.has(type)) return;
    if (game.inventory[type] === 0) {
        announce(`${ITEM_TYPES[type].name} is out of stock. Sort more donations to restock.`);
        playSound(false);
        return;
    }
    game.inventory[type]--;
    guest.requests.delete(type);
    game.score += 25 + (type === 'jackets' ? game.event.jacketBonus ?? 0 : 0);
    if (guest.requests.size === 0) {
        game.guests.delete(guest.id);
        game.served++;
        announce(`${guest.profile.name} has everything they need.`);
    } else {
        announce(`${ITEM_TYPES[type].name} given to ${guest.profile.name}.`);
    }
    const hadFocus = byId(guest.id).contains(document.activeElement);
    renderGuests();
    if (hadFocus) {
        focusGuestQueue(byId(guest.id)?.querySelector('button'));
    }
    renderSupplies();
    updateStats();
    playSound(true);
    analytics('fulfill_request', { item: type });
}

function callVolunteers() {
    if (game.score < VOLUNTEER_COST || game.time < game.volunteersUntil) return;
    game.score -= VOLUNTEER_COST;
    game.volunteersUntil = game.time + 8000;
    for (const unit of game.equipment.filter(unit => unit.state === 'dirty')) {
        startEquipment(unit, 'cleaning', 1000);
    }
    for (const type of game.supplies.values()) game.inventory[type]++;
    game.supplies.clear();
    game.selectedSupply = null;
    game.stress = Math.max(0, game.stress - 30);
    renderSupplies();
    renderGuests();
    updateStats();
    announce('Volunteers are cleaning stations and stocking supplies.');
}

function updateStats() {
    const stress = Math.min(100, Math.floor(game.stress));
    const labels = {
        score: String(game.score),
        served: String(game.served),
        'upset-guests-display': `${Math.min(game.guestsLeft, MAX_GUESTS_LEFT)} / ${MAX_GUESTS_LEFT}`,
        'stress-value': `${stress}%`
    };
    for (const [id, text] of Object.entries(labels)) {
        const element = byId(id);
        if (element.textContent !== text) element.textContent = text;
    }
    const meter = byId('stress-bar');
    if (meter.value !== stress) {
        meter.value = stress;
        meter.dataset.level = stress > 75 ? 'low' : stress > 40 ? 'medium' : 'high';
    }
    const helpers = game.time < game.volunteersUntil;
    volunteer.disabled = game.score < VOLUNTEER_COST || helpers;
    const label = helpers ? 'Volunteers helping' : 'Call volunteers';
    if (volunteer.textContent !== label) {
        volunteer.textContent = label;
        volunteerStill.hidden = helpers;
        volunteerSprite.hidden = !helpers;
    }
    donate.disabled = game.time < game.nextDropAt;
}

function renderEquipment() {
    byId('shower-stalls-area').replaceChildren();
    byId('laundry-machines-area').replaceChildren();
    for (const unit of game.equipment) {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = unit.id;
        button.className = `equipment ${unit.type === 'shower' ? 'shower-stall' : 'laundry-machine'}`;
        button.addEventListener('click', () => {
            if (unit.state === 'dirty') clean(unit);
            else if (game.selectedGuest) startService(game.selectedGuest, unit);
            else if (unit.state === 'available') announce('Select a guest who needs this service.');
        });
        registerDropTarget(button,
            () => dragged?.kind === 'guest' && unit.state === 'available' && game.guests.get(dragged.id)?.state === unit.type,
            () => startService(dragged.id, unit));
        byId(unit.type === 'shower' ? 'shower-stalls-area' : 'laundry-machines-area').append(button);
        renderUnit(unit);
    }
}

function renderUnit(unit) {
    const button = byId(unit.id);
    const labels = { available: 'Available', occupied: SERVICE_INFO[unit.type].busy, dirty: 'Clean now', cleaning: 'Cleaning' };
    const busy = unit.state === 'occupied' || unit.state === 'cleaning';
    button.dataset.state = unit.state;
    button.setAttribute('aria-disabled', String(busy));
    const picture = unit.state === 'dirty' ? 'cleaning-kit' : unit.type;
    const frame = unit.state === 'cleaning' ? 'cleaning' : unit.type;
    button.innerHTML = `
        ${busy ? `<span class="sprite sprite--${frame}" aria-hidden="true"></span>` : art(picture, 60)}
        <strong>${unit.name}</strong>
        <span class="equipment-status">${labels[unit.state]}</span>
        ${busy ? `<progress value="0" max="100" aria-label="${unit.name} progress"></progress>` : ''}`;
    const dirtyCount = game.equipment.filter(equipment => equipment.state === 'dirty').length;
    const badge = byId('clean-count');
    badge.textContent = dirtyCount;
    badge.hidden = dirtyCount === 0;
}

function updateEquipmentTargets() {
    const guest = game.guests.get(game.selectedGuest);
    for (const unit of game.equipment) {
        byId(unit.id).classList.toggle('tap-target', unit.state === 'available' && guest?.state === unit.type);
    }
}

function focusGuestQueue(button = guestQueue.querySelector('button')) {
    (button ?? byId('guest-title')).focus({ preventScroll: true });
}

function renderGuests() {
    let visibleCount = 0;
    let restoreFocus = false;
    for (const card of [...guestQueue.children]) {
        const guest = game.guests.get(card.id);
        if (!guest || guest.state === 'in-service') {
            restoreFocus ||= card.contains(document.activeElement);
            card.remove();
        }
    }

    for (const guest of game.guests.values()) {
        if (guest.state === 'in-service') continue;
        visibleCount++;
        let card = byId(guest.id);
        if (!card) {
            card = document.createElement('article');
            card.id = guest.id;
            guestQueue.append(card);
        }
        const service = SERVICE_INFO[guest.state];
        const { name, portrait } = guest.profile;
        const selected = game.selectedGuest === guest.id;
        card.className = `guest-card${selected ? ' selected' : ''}`;
        const requestKey = guest.requests ? [...guest.requests].join(' ') : '';
        if (card.dataset.state !== guest.state || card.dataset.items !== requestKey) {
            card.dataset.state = guest.state;
            card.dataset.items = requestKey;
            const identity = `${art(portrait, 42)}<span><strong>${name}</strong><small>${service?.label ?? 'Needs supplies'}</small></span>`;
            card.innerHTML = service
                ? `<button type="button" class="guest guest-identity" draggable="true">${identity}</button>
                   <button type="button" class="guest-action"></button>`
                : `<div class="guest-identity">${identity}</div>
                   <div class="request-list">${[...guest.requests].map(type => `
                       <button type="button" class="requested-item" data-type="${type}">
                           ${art(ITEM_TYPES[type].art, 27)}<span>${ITEM_TYPES[type].name}</span>
                       </button>`).join('')}</div>`;
            card.insertAdjacentHTML('beforeend', `
                <progress class="patience-meter" value="${guest.waitLeft / guest.waitMax * 100}" max="100" aria-label="${name} patience"></progress>`);
        }
        if (service) {
            const action = card.querySelector('.guest-action');
            const available = game.equipment.some(unit => unit.type === guest.state && unit.state === 'available');
            const label = available ? service.action : service.unavailable;
            if (action.textContent !== label) action.textContent = label;
            action.disabled = !available;
            card.querySelector('.guest').setAttribute('aria-pressed', String(selected));
        } else {
            for (const button of card.querySelectorAll('.requested-item')) {
                const type = button.dataset.type;
                const available = game.inventory[type] > 0;
                button.classList.toggle('out-of-stock', !available);
                button.setAttribute('aria-label', available ? `Give ${ITEM_TYPES[type].name}` : `${ITEM_TYPES[type].name} out of stock`);
            }
        }
    }
    byId('guest-count').textContent = visibleCount;
    byId('guest-empty').hidden = visibleCount > 0;
    if (restoreFocus) focusGuestQueue();
}

bins.innerHTML = Object.entries(ITEM_TYPES).map(([type, item]) => `
    <button type="button" class="supply-bin" data-type="${type}">
        ${art(item.art, 44)}<span>${item.name}</span><strong id="${type}-stock">0</strong>
    </button>`).join('');

function renderSupplies() {
    for (const button of [...dropArea.children]) {
        if (!game.supplies.has(button.id)) button.remove();
    }
    for (const [id, type] of game.supplies) {
        if (!byId(id)) {
            const item = ITEM_TYPES[type];
            dropArea.insertAdjacentHTML('beforeend', `
                <button type="button" class="supply-item" id="${id}" data-type="${type}" draggable="true">
                    ${art(item.art, 42)}<span>${item.name}</span>
                </button>`);
        }
        const button = byId(id);
        const selected = id === game.selectedSupply;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
    }
    byId('drop-count').textContent = game.supplies.size;
    byId('donation-empty').hidden = game.supplies.size > 0;
    for (const bin of bins.children) {
        const type = bin.dataset.type;
        const stock = game.inventory[type];
        byId(`${type}-stock`).textContent = stock;
        bin.setAttribute('aria-label', `${ITEM_TYPES[type].name} bin, ${stock} in stock`);
        bin.classList.toggle('supply-tap-target', Boolean(game.selectedSupply));
    }
}

function registerDropTarget(button, accepts, drop) {
    button.addEventListener('dragover', event => {
        if (!accepts()) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        button.classList.add('droppable');
    });
    button.addEventListener('dragleave', event => {
        if (!button.contains(event.relatedTarget)) button.classList.remove('droppable');
    });
    button.addEventListener('drop', event => {
        if (!accepts()) return;
        event.preventDefault();
        drop();
        clearDrag();
    });
}

function clearDrag() {
    dragged?.element.classList.remove('dragging');
    document.querySelectorAll('.droppable').forEach(element => element.classList.remove('droppable'));
    dragged = null;
}

document.addEventListener('dragstart', event => {
    const element = event.target.closest('.guest, .supply-item');
    if (!element) return;
    const guestCard = element.closest('.guest-card');
    dragged = { element, kind: guestCard ? 'guest' : 'supply', id: guestCard?.id ?? element.id };
    event.dataTransfer.setData('text/plain', dragged.id);
    event.dataTransfer.effectAllowed = 'move';
    element.classList.add('dragging');
});
document.addEventListener('dragend', clearDrag);

guestQueue.addEventListener('click', event => {
    const card = event.target.closest('.guest-card');
    if (!card) return;
    const guest = game.guests.get(card.id);
    const item = event.target.closest('.requested-item');
    if (item) {
        fulfillRequest(guest, item.dataset.type);
    } else if (event.target.closest('.guest-action')) {
        const unit = game.equipment.find(unit => unit.type === guest.state && unit.state === 'available');
        startService(guest.id, unit);
    } else if (event.target.closest('.guest')) {
        game.selectedGuest = game.selectedGuest === guest.id ? null : guest.id;
        renderGuests();
        updateEquipmentTargets();
        if (game.selectedGuest) announce(`${guest.profile.name} selected. Choose an available station.`);
    }
});

dropArea.addEventListener('click', event => {
    const item = event.target.closest('.supply-item');
    if (!item) return;
    game.selectedSupply = game.selectedSupply === item.id ? null : item.id;
    renderSupplies();
});

for (const bin of bins.children) {
    const type = bin.dataset.type;
    bin.addEventListener('click', () => {
        if (game.selectedSupply) sortSupply(game.selectedSupply, type);
    });
    registerDropTarget(bin, () => dragged?.kind === 'supply', () => sortSupply(dragged.id, type));
}

function endGame(reason) {
    clearInterval(clock);
    help.close();
    leaderboard.close();
    byId('final-score').textContent = game.score;
    byId('game-over-reason').textContent = reason;
    scoreForm.reset();
    scoreForm.hidden = game.score === 0;
    scoreForm.querySelector('button').disabled = false;
    byId('score-feedback').textContent = '';
    gameOver.showModal();
    analytics('game_over', { reason });
}

async function fetchLeaderboard() {
    const container = byId('leaderboard-table-container');
    container.textContent = 'Loading scores…';
    try {
        const response = await fetch(`${API}?action=get`);
        if (!response.ok) throw new Error('Leaderboard request failed');
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) throw new Error('Unexpected leaderboard data');
        if (result.data.length === 0) {
            container.textContent = 'No scores yet.';
            return;
        }
        const table = document.createElement('table');
        table.innerHTML = '<thead><tr><th scope="col">Name</th><th scope="col">Score</th></tr></thead>';
        const body = table.createTBody();
        for (const entry of result.data.slice(0, 5)) {
            const row = body.insertRow();
            row.insertCell().textContent = entry.playerName || 'Anonymous';
            row.insertCell().textContent = Number.parseInt(entry.score, 10) || 0;
        }
        container.replaceChildren(table);
    } catch {
        container.textContent = 'Couldn’t load scores. Try again later.';
    }
}

scoreForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = scoreForm.querySelector('button');
    const name = byId('player-name').value.trim();
    if (!name) {
        byId('score-feedback').textContent = 'Enter a name to save your score.';
        byId('player-name').focus();
        return;
    }
    const completedGame = game;
    button.disabled = true;
    byId('score-feedback').textContent = 'Saving score…';
    try {
        const response = await fetch(API, {
            method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'submit', playerName: name, score: completedGame.score })
        });
        if (!response.ok || !(await response.json()).success) throw new Error('Score request failed');
        if (game === completedGame) byId('score-feedback').textContent = 'Score saved to the leaderboard.';
    } catch {
        if (game === completedGame) {
            byId('score-feedback').textContent = 'Couldn’t save your score. Try again.';
            button.disabled = false;
        }
    }
});

byId('start-game-btn').addEventListener('click', startGame);
byId('restart-game-btn').addEventListener('click', startGame);
byId('help-btn').addEventListener('click', () => help.showModal());
byId('leaderboard-btn').addEventListener('click', () => {
    leaderboard.showModal();
    fetchLeaderboard();
});
gameOver.addEventListener('cancel', event => event.preventDefault());
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
});
donate.addEventListener('click', acceptDonations);
volunteer.addEventListener('click', callVolunteers);
