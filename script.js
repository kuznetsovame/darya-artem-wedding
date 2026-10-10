const target=new Date('2027-01-23T15:00:00+03:00').getTime();function updateCountdown(){const ms=Math.max(0,target-Date.now());const values={days:Math.floor(ms/86400000),hours:Math.floor(ms/3600000)%24,minutes:Math.floor(ms/60000)%60,seconds:Math.floor(ms/1000)%60};Object.entries(values).forEach(([id,n])=>document.getElementById(id).textContent=String(n).padStart(2,'0'))}updateCountdown();setInterval(updateCountdown,1000);const form=document.getElementById('guest-form');const partnerDetails=document.getElementById('partner-details');const childrenDetails=document.getElementById('children-details');const childrenList=document.getElementById('children-list');const addChildButton=document.getElementById('add-child');let childIndex=1;
function updateFields(){const absent=form.querySelector('input[name="attendance"]:checked')?.value==='no';form.querySelectorAll('.optional-question').forEach(group=>{group.hidden=absent;group.querySelectorAll('input').forEach(input=>{input.required=!absent;if(absent)input.checked=false})});const hasPartner=!absent&&form.querySelector('input[name="partner"]:checked')?.value==='yes';const hasChildren=!absent&&form.querySelector('input[name="children"]:checked')?.value==='yes';partnerDetails.hidden=!hasPartner;childrenDetails.hidden=!hasChildren;partnerDetails.querySelectorAll('input').forEach(input=>input.disabled=!hasPartner);childrenDetails.querySelectorAll('input').forEach(input=>input.disabled=!hasChildren)}
form.querySelectorAll('input[name="attendance"],input[name="partner"],input[name="children"]').forEach(el=>el.addEventListener('change',updateFields));
addChildButton.addEventListener('click',()=>{childIndex++;const row=document.createElement('div');row.className='child-entry';const label=document.createElement('label');label.className='field-label';label.htmlFor='child-name-'+childIndex;label.textContent='Имя и фамилия ребёнка';const input=document.createElement('input');input.className='detail-input child-name';input.id='child-name-'+childIndex;input.name='childName'+childIndex;input.type='text';input.placeholder='Имя и фамилия ребёнка';input.maxLength=120;input.required=true;const remove=document.createElement('button');remove.type='button';remove.className='remove-child';remove.textContent='Убрать';remove.setAttribute('aria-label','Убрать ребёнка');remove.addEventListener('click',()=>row.remove());row.append(label,input,remove);childrenList.append(row);input.focus()});
const RSVP_ENDPOINT='https://script.google.com/macros/s/AKfycbwPAv9htQfdIyk5AX0wQch_m6ZmfooHJxXBNQM7ccXTUgF1c6Ku-XWj_jAKyCZHY2U/exec';
const formMessage=document.getElementById('form-message');
const submitButton=form.querySelector('button[type="submit"]');
let pendingSubmissionId=null;
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity()||submitButton.disabled)return;
  const data=new FormData(form);
  const attendance=data.get('attendance');
  const item={
    submissionId:pendingSubmissionId||(pendingSubmissionId=crypto.randomUUID()),
    name:String(data.get('name')||'').trim(),
    attendance,
    partner:attendance==='yes'?data.get('partner'):'no',
    partnerName:attendance==='yes'?String(data.get('partnerName')||'').trim():'',
    children:attendance==='yes'?data.get('children'):'no',
    childrenNames:attendance==='yes'?[...form.querySelectorAll('.child-name:not(:disabled)')].map(input=>input.value.trim()).filter(Boolean):[],
    website:''
  };
  submitButton.disabled=true;
  formMessage.textContent='Отправляем ваш ответ…';
  try{
    // Apps Script не поддерживает обычную CORS-проверку ответа с GitHub Pages.
    // no-cors отправляет запрос, но браузер не может подтвердить запись в таблицу.
    await fetch(RSVP_ENDPOINT,{
      method:'POST',mode:'no-cors',redirect:'follow',
      headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body:new URLSearchParams({payload:JSON.stringify(item)})
    });
    formMessage.textContent='Ответ отправлен! Спасибо! Если возникнут сомнения, свяжитесь с нами лично.';
    form.reset();
    childrenList.querySelectorAll('.child-entry:not(:first-child)').forEach(row=>row.remove());
    childIndex=1;
    pendingSubmissionId=null;
    updateFields();
  }catch(error){
    formMessage.textContent='Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз.';
  }finally{submitButton.disabled=false}
});
updateFields();
