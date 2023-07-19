const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themetoggler = document.querySelector(".theme-toggler");
menuBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'block';
})

closeBtn.addEventListener('click',()=>{
    sideMenu.style.display = 'none';
})

themetoggler.addEventListener('click',()=>{
    document.body.classList.toggle('dark-theme-variables');
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
})

// Orders.forEach(order=>{
//     const tr=document.createElement('tr');
//     const trContent = `
//                <td>${order.productName}</td>
//                <td>${order.productNumber}</td>
//                <td>${order.paymentStatus}</td>
//                <td class="${order.shipping === 'Declined' ? 'danger' : order.shipping === 'pending' ? 'warning' :'primary'}">${order.shipping}</td>
//                <td class="primary">Details</td>
//                `;
//     tr.innerHTML=trContent;
//     document.querySelector('table tbody').appendChild(tr);
// })

const sidebarLinks = document.querySelectorAll('.sidebar a');

sidebarLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    sidebarLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');

    const href = link.getAttribute('href');
    window.location.href = href;
  });
});



const searchInput = document.getElementById('searchInput');
const tableRows = document.querySelectorAll('#userDataTable tbody tr');

searchInput.addEventListener('input', function() {
  const searchValue = this.value.trim().toLowerCase();

  tableRows.forEach(row => {
    const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
    const mobile = row.querySelector('td:nth-child(4)').textContent.toLowerCase();

    if (name.includes(searchValue) || email.includes(searchValue) || mobile.includes(searchValue)) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  });
});