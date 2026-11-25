const data = [['Світла квартира на Подолі', 'Квартира', 'Київ', 64, 89000], ['Будинок біля лісу', 'Будинок', 'Львів', 148, 165000], ['Будівля для бізнесу', 'Будівля', 'Львів', 320, 240000], ['Квартира з видом на місто', 'Квартира', 'Львів', 48, 72000], ['Сімейний будинок із садом', 'Будинок', 'Київ', 180, 210000], ['Офісний простір', 'Будівля', 'Київ', 210, 195000]];
const $ = s => document.querySelector(s);
const photoIds = [2, 0, 4, 5, 3, 1];
const photo = o => '<img class="property-photo" src="images/property-' + photoIds[data.indexOf(o)] + '.jpg" alt="' + o[1] + ': ' + o[0] + '" loading="lazy" width="1200" height="800">';

function render() {
    let list = data.filter(o => (!$('#type').value || o[1] === $('#type').value) && (!$('#city').value || o[2] === $('#city').value));
    $('#count').textContent = 'Знайдено об’єктів: ' + list.length;
    $('#cards').innerHTML = list.map(o => '<div class="col-12 col-md-6 col-xl-4"><article class="card h-100">' + photo(o) + '<div class="card-body"><span class="badge text-bg-light mb-3">' + o[1] + '</span><h3 class="h5">' + o[0] + '</h3><p class="text-secondary"><i class="bi bi-geo-alt"></i> ' + o[2] + ' · ' + o[3] + ' м²</p><div class="d-flex justify-content-between align-items-center"><strong>' + o[4].toLocaleString('uk-UA') + ' $</strong><button class="btn btn-outline-dark" data-id="' + data.indexOf(o) + '">Деталі ↗</button></div></div></article></div>').join('') || '<p class="alert alert-secondary">Немає об’єктів. Змініть умови пошуку.</p>';
}

$('#filter').onsubmit = e => {
    e.preventDefault();
    render()
};
$('#filter').onreset = () => setTimeout(render, 0);
let selected;
$('#cards').onclick = e => {
    let b = e.target.closest('[data-id]');
    if (!b) return;
    selected = data[b.dataset.id];
    $('#title').textContent = selected[0];
    $('#description').textContent = selected[1] + ' у місті ' + selected[2] + '. Площа ' + selected[3] + ' м². Вартість ' + selected[4].toLocaleString('uk-UA') + ' $.';
    bootstrap.Modal.getOrCreateInstance($('#details')).show()
};
$('#choose').onclick = () => {
    $('#message').value = 'Мене цікавить: ' + selected[0];
    bootstrap.Modal.getInstance($('#details')).hide();
    $('#contact').scrollIntoView()
};
$('#request').oninput = () => {
    let n = ['#name', '#email'].filter(s => $(s).checkValidity()).length;
    $('#bar').style.width = n * 50 + '%';
    $('.progress').setAttribute('aria-valuenow', n * 50);
    $('#progressText').textContent = 'Заповнено ' + n + ' із 2 полів'
};
$('#request').onsubmit = e => {
    e.preventDefault();
    e.target.classList.add('was-validated');
    if (!e.target.checkValidity()) {
        e.target.querySelector(':invalid').focus();
        return;
    }
    $('#result').innerHTML = '<div class="alert alert-success">Демозаявку створено. Дані не надсилалися.</div>';
    bootstrap.Toast.getOrCreateInstance($('#toast')).show()
};
render();