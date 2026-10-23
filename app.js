(() => {
  'use strict';

  const SIGNATURE = '資通系 李振偉老師';
  const CART_KEY = 'menya-haru-cart-v1';
  const ORDER_KEY = 'menya-haru-orders-v1';
  const ADMIN_KEY = 'menya-haru-admin-session';
  const CATEGORIES = ['全部拉麵', '豚骨拉麵', '醬油拉麵', '沾麵'];
  const menu = [
    {id:'tonkotsu-yuzu',name:'柚香鹽豚骨',category:'豚骨拉麵',price:250,description:'濃醇豚骨湯底，收尾帶一點清爽柚香。',tag:'小晴推薦',soup:'#d68a59',meat:'#c76e57',toppings:['egg','pork','nori','green']},
    {id:'tonkotsu-char-siu',name:'炙燒叉燒豚骨',category:'豚骨拉麵',price:280,description:'炙香叉燒疊上慢熬湯頭，溫暖而飽滿。',tag:'招牌人氣',soup:'#c8794d',meat:'#b95645',toppings:['pork','pork','egg','nori']},
    {id:'tonkotsu-garlic',name:'濃厚蒜香豚骨',category:'豚骨拉麵',price:270,description:'蒜香與豚骨的厚實相遇，濃而不膩。',tag:'濃厚系',soup:'#d19a57',meat:'#be684e',toppings:['garlic','pork','nori','green']},
    {id:'shoyu-duck',name:'鴨湯黑醬油',category:'醬油拉麵',price:290,description:'鴨湯的細緻油香，接上回甘黑醬油。',tag:'風味限定',soup:'#8e5b3c',meat:'#bd735d',toppings:['egg','duck','nori','green']},
    {id:'shoyu-chicken',name:'雞白湯醬油',category:'醬油拉麵',price:260,description:'雞白湯柔和順口，醬油添一縷熟成香。',tag:'清爽順口',soup:'#bf8751',meat:'#d18f69',toppings:['egg','chicken','nori','green']},
    {id:'shoyu-citrus',name:'柚香雞清湯',category:'醬油拉麵',price:250,description:'清澈雞湯與柚子皮香氣，輕盈不厚重。',tag:'清湯之選',soup:'#d1ad67',meat:'#ce8c68',toppings:['citrus','chicken','nori','green']},
    {id:'tsukemen-fish',name:'濃厚魚介沾麵',category:'沾麵',price:290,description:'魚介高湯濃縮成沾汁，麵條紮實彈牙。',tag:'麵香十足',soup:'#945e3f',meat:'#b95f4e',toppings:['fish','egg','pork','nori']},
    {id:'tsukemen-sesame',name:'胡麻冷沾麵',category:'沾麵',price:250,description:'焙煎胡麻清香滑順，適合慢慢享用。',tag:'季節推薦',soup:'#b47a45',meat:'#c8795e',toppings:['sesame','cucumber','egg','green']},
    {id:'tsukemen-spicy',name:'辣味噌沾麵',category:'沾麵',price:280,description:'味噌的甘與辣椒的暖，越吃越涮嘴。',tag:'微辣暖心',soup:'#b65d3b',meat:'#c77a55',toppings:['chili','pork','nori','green']}
  ];
  const addOns = [{id:'egg',name:'加購溏心蛋',price:25},{id:'chashu',name:'加購叉燒',price:40}];
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const customerView = $('#customer-view');
  const adminView = $('#admin-view');
  const cart = load(CART_KEY, []);
  let activeCategory = '全部拉麵';
  let selectedDish = null;
  let modalQuantity = 1;
  let toastTimer = null;

  function load(key, fallback) {
    try { const parsed = JSON.parse(localStorage.getItem(key)); return parsed ?? fallback; }
    catch { return fallback; }
  }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function escapeHTML(value='') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function money(value) { return `NT$ ${Number(value || 0).toLocaleString('zh-TW')}`; }
  function getDish(id) { return menu.find(dish => dish.id === id); }
  function cartQty() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
  function itemUnit(item) { const dish=getDish(item.dishId); return (dish?.price || 0) + (item.addOns || []).reduce((sum, id) => sum + (addOns.find(addon=>addon.id===id)?.price || 0), 0); }
  function cartTotal() { return cart.reduce((sum,item)=>sum + itemUnit(item)*item.quantity,0); }
  function showToast(message) {
    const toast=$('#toast'); toast.textContent=message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2400);
  }

  function toppingMarkup(kind, x, y, scale=1) {
    const tr=`translate(${x} ${y}) scale(${scale})`;
    if(kind==='egg') return `<g transform="${tr}"><circle r="19" fill="#f5e5b1" stroke="#fff7dc" stroke-width="5"/><circle r="8" fill="#e89546"/><circle cx="-4" cy="-5" r="3" fill="#f7bd63" opacity=".8"/></g>`;
    if(kind==='pork'||kind==='duck'||kind==='chicken') return `<g transform="${tr}"><ellipse rx="26" ry="16" fill="${kind==='duck'?'#bb7660':kind==='chicken'?'#d89d72':'#c37861'}" stroke="#f3d9c0" stroke-width="4"/><path d="M-15-1c8-8 17-6 22 0 4 6 0 11-8 11-8 0-15-3-14-11Z" fill="#e8b6a0" opacity=".85"/></g>`;
    if(kind==='nori') return `<g transform="${tr}"><path d="M-17 22 0-26 24-22 10 25Z" fill="#385747" stroke="#e9ead8" stroke-width="3"/><path d="m-3-15 20 2M-8-1l20 2M-12 13l20 2" stroke="#77947b" stroke-width="2" opacity=".8"/></g>`;
    if(kind==='green') return `<g transform="${tr}" fill="#6c966a" stroke="#e8eedc" stroke-width="2"><path d="M0 15C-17 2-14-15-1-20 7-7 7 3 0 15Z"/><path d="M2 14C8-3 22-11 30-4 25 9 15 15 2 14Z"/><path d="M-2 12C-7 2-1-6 7-8 9 1 4 9-2 12Z"/></g>`;
    if(kind==='garlic') return `<g transform="${tr}" fill="#f1d993" stroke="#fff0c0" stroke-width="2"><circle cx="-9" cy="0" r="8"/><circle cx="7" cy="-7" r="8"/><circle cx="10" cy="8" r="7"/></g>`;
    if(kind==='citrus') return `<g transform="${tr}"><circle r="18" fill="#efd568" stroke="#fff1ac" stroke-width="4"/><circle r="9" fill="#f7e99d"/><path d="M0-9v18M-9 0h18M-6-6l12 12M6-6-6 6" stroke="#d2a34b" stroke-width="2"/></g>`;
    if(kind==='fish') return `<g transform="${tr}" fill="#e8ddbb" stroke="#fff4d9" stroke-width="2"><path d="M-19 0c10-14 24-14 36 0-12 14-26 14-36 0Z"/><path d="m-18 0-12-10v20Z"/><circle cx="10" cy="-3" r="2.2" fill="#455348" stroke="none"/></g>`;
    if(kind==='sesame') return `<g transform="${tr}" fill="#f3e2ba"><ellipse cx="-9" cy="0" rx="4" ry="2.5" transform="rotate(-28 -9 0)"/><ellipse cx="0" cy="-8" rx="4" ry="2.5" transform="rotate(24 0 -8)"/><ellipse cx="9" cy="2" rx="4" ry="2.5" transform="rotate(-18 9 2)"/><ellipse cx="-1" cy="9" rx="4" ry="2.5" transform="rotate(12 -1 9)"/></g>`;
    if(kind==='cucumber') return `<g transform="${tr}"><ellipse rx="8" ry="19" fill="#73a072" stroke="#e6efd8" stroke-width="3"/><ellipse rx="3" ry="11" fill="#c3d894"/><circle cx="0" cy="-7" r="1.5" fill="#779757"/><circle cx="0" cy="7" r="1.5" fill="#779757"/></g>`;
    if(kind==='chili') return `<g transform="${tr}"><path d="M-20 9c0-15 24-24 35-14 9 8-6 23-23 22-9 0-12-2-12-8Z" fill="#cd5540"/><path d="M11-7c3-5 6-8 11-7" fill="none" stroke="#6f8d58" stroke-width="4" stroke-linecap="round"/></g>`;
    return '';
  }

  function bowlSVG(dish, compact=false) {
    const toppings=dish.toppings || [];
    const positions=[[166,132],[223,108],[282,133],[332,110]];
    const garnish=toppings.map((kind,index)=>toppingMarkup(kind,...positions[index],.82)).join('');
    const noodleCount=dish.category==='沾麵'?4:3;
    const noodles=Array.from({length:noodleCount},(_,i)=>`<path d="M${171+i*7} ${159+i%2*5}c22-17 40 18 60 0s36 16 58-1 34 13 50-1" fill="none" stroke="${i%2?'#f4d877':'#f7e49c'}" stroke-width="${i===0?5:3.4}" stroke-linecap="round" opacity=".96"/>`).join('');
    const isDipping=dish.category==='沾麵';
    const sauce=isDipping?`<ellipse cx="344" cy="211" rx="43" ry="28" fill="${dish.soup}" stroke="#fff4df" stroke-width="5"/><path d="M315 211c12-14 22 13 36 0s20 5 25-2" fill="none" stroke="#f3d47b" stroke-width="4" stroke-linecap="round"/>`:'';
    const width=compact?260:390;
    return `<svg viewBox="0 0 420 270" role="img" aria-label="${escapeHTML(dish.name)} SVG 拉麵插畫"><ellipse cx="215" cy="232" rx="145" ry="14" fill="#95ab98" opacity=".35"/><path d="M92 120c5-42 53-66 117-66s112 24 117 66" fill="none" stroke="#cf9c5e" stroke-width="6" stroke-linecap="round" opacity=".7"/><path d="M156 89c-9-16 10-21 2-37m55 36c-8-17 11-22 3-40m54 42c-8-15 9-21 2-35" fill="none" stroke="#fffdf3" stroke-width="5" stroke-linecap="round"/><ellipse cx="210" cy="126" rx="139" ry="45" fill="#f8edcf" stroke="#3c3b34" stroke-width="6"/><ellipse cx="210" cy="126" rx="121" ry="31" fill="${dish.soup}"/><path d="M75 132c7 73 49 111 135 111s128-38 135-111c-34 20-80 31-135 31s-101-11-135-31Z" fill="#bd4035" stroke="#3c3b34" stroke-width="6"/><path d="M122 183c38 20 138 22 176 0" fill="none" stroke="#ecaf66" stroke-width="7" opacity=".75"/><ellipse cx="210" cy="244" rx="57" ry="8" fill="#f7eacd" stroke="#3c3b34" stroke-width="5"/>${noodles}${garnish}${sauce}<circle cx="207" cy="119" r="4" fill="#fff5d0"/><circle cx="242" cy="143" r="4" fill="#fff5d0"/><circle cx="183" cy="146" r="3.5" fill="#fff5d0"/></svg>`;
  }

  function renderCategories() {
    $('#category-tabs').innerHTML=CATEGORIES.map(category=>`<button class="category-tab${activeCategory===category?' active':''}" type="button" data-category="${category}" aria-pressed="${activeCategory===category}">${category}</button>`).join('');
  }
  function renderMenu() {
    const visible=activeCategory==='全部拉麵'?menu:menu.filter(dish=>dish.category===activeCategory);
    $('#menu-count').textContent=`${String(visible.length).padStart(2,'0')} DISHES`;
    $('#menu-grid').innerHTML=visible.map((dish,index)=>`<article class="menu-card"><div class="dish-art"><span class="dish-tag">${escapeHTML(dish.tag)}</span>${bowlSVG(dish)}<span class="dish-index">${String(menu.indexOf(dish)+1).padStart(2,'0')}</span></div><div class="dish-info"><div class="dish-meta"><h3>${escapeHTML(dish.name)}</h3><span class="dish-price"><small>NT$</small>${dish.price}</span></div><p>${escapeHTML(dish.description)}</p><div class="dish-divider"></div><div class="dish-actions"><span>${escapeHTML(dish.category)} · 麵條可客製</span><button type="button" data-add-dish="${dish.id}" aria-label="客製並加入${escapeHTML(dish.name)}">客製點餐 <span>＋</span></button></div></div></article>`).join('');
  }

  function openProductModal(id) {
    selectedDish=getDish(id); if(!selectedDish)return; modalQuantity=1;
    const modal=$('#product-modal');
    modal.innerHTML=`<div class="product-modal-art">${bowlSVG(selectedDish)}</div><div class="product-modal-content"><button class="icon-button modal-close" id="close-product" type="button" aria-label="關閉餐點選項">×</button><span class="section-kicker">CUSTOMIZE YOUR BOWL</span><h2 id="modal-title">${escapeHTML(selectedDish.name)}</h2><p class="modal-description">${escapeHTML(selectedDish.description)}</p><div class="option-group"><div class="option-title">麵條硬度</div><div class="option-options">${['偏軟','普通','偏硬'].map((label,index)=>`<label class="option-chip"><input type="radio" name="firmness" value="${label}" ${index===1?'checked':''}><span>${label}</span></label>`).join('')}</div></div><div class="option-group"><div class="option-title">加購配料</div><div class="addon-list">${addOns.map(addon=>`<label class="addon-row"><input type="checkbox" name="addon" value="${addon.id}"><span>${addon.name}</span><span class="addon-price">+ NT$ ${addon.price}</span></label>`).join('')}</div></div><div class="modal-quantity"><span>數量</span><div class="quantity-control"><button id="modal-qty-minus" type="button" aria-label="減少數量">−</button><span id="modal-qty">1</span><button id="modal-qty-plus" type="button" aria-label="增加數量">＋</button></div></div><button class="button button-primary modal-add" id="add-custom-dish" type="button"><span>加入購物車</span><span id="modal-add-price">${money(selectedDish.price)}</span></button></div>`;
    $('#modal-backdrop').hidden=false;modal.hidden=false;document.body.classList.add('locked');
    $('#close-product').addEventListener('click',closeProductModal);
    $('#modal-qty-minus').addEventListener('click',()=>setModalQuantity(-1));
    $('#modal-qty-plus').addEventListener('click',()=>setModalQuantity(1));
    $$('input[name="addon"]',modal).forEach(input=>input.addEventListener('change',updateModalPrice));
    $('#add-custom-dish').addEventListener('click',addSelectedDish);
    updateModalPrice();
  }
  function setModalQuantity(change){modalQuantity=Math.min(20,Math.max(1,modalQuantity+change));$('#modal-qty').textContent=modalQuantity;updateModalPrice();}
  function updateModalPrice(){if(!selectedDish)return;const extras=$$('input[name="addon"]:checked',$('#product-modal')).reduce((sum,input)=>sum+(addOns.find(addon=>addon.id===input.value)?.price||0),0);$('#modal-add-price').textContent=money((selectedDish.price+extras)*modalQuantity);}
  function closeProductModal(){$('#product-modal').hidden=true;$('#modal-backdrop').hidden=true;document.body.classList.remove('locked');selectedDish=null;}
  function addSelectedDish(){
    const firmness=$('input[name="firmness"]:checked',$('#product-modal'))?.value||'普通';
    const selectedAddOns=$$('input[name="addon"]:checked',$('#product-modal')).map(input=>input.value).sort();
    const cartKey=[selectedDish.id,firmness,selectedAddOns.join(',')].join('|');
    const existing=cart.find(item=>item.key===cartKey);
    if(existing)existing.quantity+=modalQuantity;else cart.push({key:cartKey,dishId:selectedDish.id,firmness,addOns:selectedAddOns,quantity:modalQuantity});
    save(CART_KEY,cart);renderCart();closeProductModal();showToast('已加入購物車');
  }

  function renderCart(){
    const count=cartQty();$('#cart-count').textContent=count;$('#drawer-cart-count').textContent=count;
    $('#cart-total').textContent=money(cartTotal());$('#checkout-total').textContent=money(cartTotal());
    if(!cart.length){$('#cart-items').innerHTML='<div class="empty-cart"><span class="empty-bowl">晴</span><b>購物車還是空的</b><p>挑一碗今天想吃的拉麵吧。</p></div>';return;}
    $('#cart-items').innerHTML=cart.map(item=>{const dish=getDish(item.dishId);if(!dish)return '';const addonText=(item.addOns||[]).map(id=>addOns.find(addon=>addon.id===id)?.name).filter(Boolean);return `<article class="cart-line"><div class="cart-thumb">${bowlSVG(dish,true)}</div><div class="cart-line-main"><h3>${escapeHTML(dish.name)}</h3><p>麵條${escapeHTML(item.firmness)}${addonText.length?` · ${addonText.map(escapeHTML).join('、')}`:''}</p><div class="cart-line-controls"><div class="quantity-control"><button type="button" data-cart-quantity="-1" data-key="${escapeHTML(item.key)}" aria-label="減少${escapeHTML(dish.name)}數量">−</button><span>${item.quantity}</span><button type="button" data-cart-quantity="1" data-key="${escapeHTML(item.key)}" aria-label="增加${escapeHTML(dish.name)}數量">＋</button></div><button class="remove-line" data-remove-cart="${escapeHTML(item.key)}" type="button">刪除</button></div></div><span class="cart-line-price">${money(itemUnit(item)*item.quantity)}</span></article>`;}).join('');
  }
  function openCart(){renderCart();$('#checkout-form').hidden=true;$('#cart-view').hidden=false;$('#drawer-backdrop').hidden=false;$('#cart-drawer').hidden=false;document.body.classList.add('locked');}
  function closeCart(){ $('#drawer-backdrop').hidden=true;$('#cart-drawer').hidden=true;document.body.classList.remove('locked');$('#checkout-form').hidden=true;$('#cart-view').hidden=false; }
  function updateCartItem(key,change){const item=cart.find(row=>row.key===key);if(!item)return;item.quantity+=change;if(item.quantity<1)cart.splice(cart.indexOf(item),1);save(CART_KEY,cart);renderCart();}
  function removeCartItem(key){const index=cart.findIndex(item=>item.key===key);if(index>=0){cart.splice(index,1);save(CART_KEY,cart);renderCart();}}

  function localInputDate(date){const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);}
  function setPickupBounds(){const now=new Date();const min=new Date(now.getTime()+10*60000);const max=new Date(now.getTime()+7*24*60*60000);const input=$('#pickup-time');input.min=localInputDate(min);input.max=localInputDate(max);if(!input.value||input.value<input.min)input.value=input.min;}
  function submitOrder(event){
    event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const phone=String(data.get('phone')||'').trim();const name=String(data.get('name')||'').trim();const pickupValue=String(data.get('pickup')||'');const error=$('#checkout-error');error.hidden=true;
    if(!/^09\d{8}$/.test(phone)){error.textContent='手機號碼格式不正確，請輸入 09 開頭的 10 位號碼。';error.hidden=false;return;}
    const pickup=new Date(pickupValue);const now=new Date();if(Number.isNaN(pickup.getTime())||pickup<new Date(now.getTime()+10*60000)||pickup>new Date(now.getTime()+7*24*60*60000)){error.textContent='請選擇 10 分鐘後至 7 天內的取餐時間。';error.hidden=false;setPickupBounds();return;}
    if(!cart.length){error.textContent='購物車目前沒有餐點。';error.hidden=false;return;}
    const orders=load(ORDER_KEY,[]);const order={id:`MH${Date.now().toString().slice(-8)}${Math.floor(Math.random()*90+10)}`,createdAt:new Date().toISOString(),name,phone,pickup:pickup.toISOString(),payment:'到店付款',status:'製作中',total:cartTotal(),items:cart.map(item=>({dishId:item.dishId,name:getDish(item.dishId)?.name||'拉麵',firmness:item.firmness,addOns:[...(item.addOns||[])],quantity:item.quantity,unitPrice:itemUnit(item)}))};
    orders.unshift(order);save(ORDER_KEY,orders);cart.splice(0,cart.length);save(CART_KEY,cart);renderCart();closeCart();$('#success-order-id').textContent=order.id;$('#success-pickup').textContent=formatDate(order.pickup);$('#modal-backdrop').hidden=false;$('#success-modal').hidden=false;document.body.classList.add('locked');form.reset();
  }
  function formatDate(value){const date=new Date(value);if(Number.isNaN(date.getTime()))return '—';return new Intl.DateTimeFormat('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date).replaceAll('/','/');}
  function closeSuccess(){ $('#success-modal').hidden=true;$('#modal-backdrop').hidden=true;document.body.classList.remove('locked'); }

  function isAdminLoggedIn(){return sessionStorage.getItem(ADMIN_KEY)==='yes';}
  function route(){const isAdmin=location.hash==='#admin';customerView.hidden=isAdmin;adminView.hidden=!isAdmin;document.body.classList.toggle('admin-mode',isAdmin);if(isAdmin){if(isAdminLoggedIn())showDashboard();else showLogin();}else{closeCart();closeProductModal();$('#success-modal').hidden=true;$('#modal-backdrop').hidden=true;document.body.classList.remove('locked');}}
  function showLogin(){ $('#admin-login-card').hidden=false;$('#admin-dashboard').hidden=true;$('#admin-logout').hidden=true; }
  function showDashboard(){ $('#admin-login-card').hidden=true;$('#admin-dashboard').hidden=false;$('#admin-logout').hidden=false;renderOrders(); }
  function login(event){event.preventDefault();const form=event.currentTarget;const username=String(new FormData(form).get('username')||'').trim();const password=String(new FormData(form).get('password')||'');const error=$('#login-error');if(username==='just'&&password==='just'){sessionStorage.setItem(ADMIN_KEY,'yes');error.hidden=true;form.reset();showDashboard();return;}error.textContent='帳號或密碼不正確，請再試一次。';error.hidden=false;}
  function logout(){sessionStorage.removeItem(ADMIN_KEY);showLogin();}
  function renderOrders(){
    const orders=load(ORDER_KEY,[]);$('#stat-count').textContent=orders.length.toLocaleString('zh-TW');$('#stat-total').textContent=money(orders.reduce((sum,order)=>sum+Number(order.total||0),0));$('#stat-completed').textContent=money(orders.filter(order=>order.status==='已完成').reduce((sum,order)=>sum+Number(order.total||0),0));$('#orders-count-label').textContent=orders.length;
    const filter=$('#status-filter').value;const visible=filter==='全部'?orders:orders.filter(order=>order.status===filter);const list=$('#orders-list');
    if(!visible.length){list.innerHTML=`<div class="empty-orders"><span>碗</span><b>${orders.length?'沒有符合狀態的訂單':'還沒有新訂單'}</b><p>${orders.length?'調整篩選條件看看其他訂單。':'送出的顧客訂單會出現在這裡。'}</p></div>`;return;}
    list.innerHTML=visible.map(order=>`<article class="order-card"><div class="order-top"><div class="order-title"><span class="order-number">${escapeHTML(order.id)}</span><span class="order-status" data-status="${escapeHTML(order.status)}">${escapeHTML(order.status)}</span></div><span class="order-date">${formatDate(order.createdAt)}</span></div><div class="order-meta"><span>顧客：<b>${escapeHTML(order.name)}</b></span><span>手機：${escapeHTML(order.phone)}</span><span>取餐：<b>${formatDate(order.pickup)}</b></span><span>付款：${escapeHTML(order.payment||'到店付款')}</span></div><div class="order-lines">${(order.items||[]).map(item=>`<div><strong>${escapeHTML(item.name)}</strong> × ${Number(item.quantity)||1} · 麵條${escapeHTML(item.firmness||'普通')}${item.addOns?.length?` · ${item.addOns.map(id=>escapeHTML(addOns.find(addon=>addon.id===id)?.name||'加料')).join('、')}`:''} <span>(${money(Number(item.unitPrice||0)*(Number(item.quantity)||1))})</span></div>`).join('')}</div><div class="order-bottom"><b class="order-total">${money(order.total)}</b><div class="order-status-control"><label for="status-${escapeHTML(order.id)}">更新狀態</label><select id="status-${escapeHTML(order.id)}" data-order-status="${escapeHTML(order.id)}"><option value="製作中" ${order.status==='製作中'?'selected':''}>製作中</option><option value="可取餐" ${order.status==='可取餐'?'selected':''}>可取餐</option><option value="已完成" ${order.status==='已完成'?'selected':''}>已完成</option></select></div></div></article>`).join('');
  }
  function updateOrderStatus(id,status){const orders=load(ORDER_KEY,[]);const order=orders.find(row=>row.id===id);if(!order)return;order.status=status;save(ORDER_KEY,orders);renderOrders();showToast(`訂單已更新為「${status}」`);}

  $('#category-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderCategories();renderMenu();});
  $('#menu-grid').addEventListener('click',event=>{const button=event.target.closest('[data-add-dish]');if(button)openProductModal(button.dataset.addDish);});
  $('#open-cart').addEventListener('click',openCart);$('#drawer-backdrop').addEventListener('click',closeCart);$$('[data-close-cart]').forEach(button=>button.addEventListener('click',closeCart));
  $('#cart-items').addEventListener('click',event=>{const quantity=event.target.closest('[data-cart-quantity]');const remove=event.target.closest('[data-remove-cart]');if(quantity)updateCartItem(quantity.dataset.key,Number(quantity.dataset.cartQuantity));if(remove)removeCartItem(remove.dataset.removeCart);});
  $('#checkout-open').addEventListener('click',()=>{if(!cart.length){showToast('先挑一碗喜歡的拉麵吧');return;}$('#cart-view').hidden=true;$('#checkout-form').hidden=false;setPickupBounds();});
  $('#checkout-back').addEventListener('click',()=>{$('#checkout-form').hidden=true;$('#cart-view').hidden=false;});$('#checkout-form').addEventListener('submit',submitOrder);
  $('#modal-backdrop').addEventListener('click',()=>{if(!$('#product-modal').hidden)closeProductModal();else if(!$('#success-modal').hidden)closeSuccess();});$$('[data-close-success]').forEach(button=>button.addEventListener('click',closeSuccess));
  $('#login-form').addEventListener('submit',login);$('#admin-logout').addEventListener('click',logout);$('#refresh-orders').addEventListener('click',()=>{renderOrders();showToast('訂單列表已更新');});$('#status-filter').addEventListener('change',renderOrders);$('#orders-list').addEventListener('change',event=>{const select=event.target.closest('[data-order-status]');if(select)updateOrderStatus(select.dataset.orderStatus,select.value);});
  window.addEventListener('hashchange',route);window.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!$('#success-modal').hidden)closeSuccess();else if(!$('#product-modal').hidden)closeProductModal();else if(!$('#cart-drawer').hidden)closeCart();}});

  renderCategories();renderMenu();renderCart();route();
  // Keep the requested author line explicit in both page footers.
  $$('.signature').forEach(node=>node.textContent=SIGNATURE);
})();

