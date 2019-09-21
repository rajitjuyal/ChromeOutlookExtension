var rrrr = document.querySelectorAll("[title=JIRA] > span:nth-child(3)>span:first-child")[0].innerText;

new Notification("NNNNNNNNN" + rrrr, {
    icon: '48.png',
    body: 'Time to make the toast.'
});