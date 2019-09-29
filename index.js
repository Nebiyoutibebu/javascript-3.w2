'use strict';

{
  function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';
      xhr.onload = () => {
        if (xhr.status < 400) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
        }
      };
      xhr.send();
    });
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  // Display repository options in the header
  function selectOptions(nameOption) {
    const selectRepoHYF = document.getElementById('selectRepoHYF');
    for (let i = 0; i < nameOption.length; i++) {
      createAndAppend('option', selectRepoHYF, { value: i, text: nameOption[i].name });
    }
  }

  // Information on left side inside a table
  function displayInformation(element) {
    const container = document.getElementById('container');
    const infoDiv = createAndAppend('div', container, {
      id: 'leftArea',
      class: 'left-div whiteframe',
    });
    createAndAppend('table', infoDiv, { id: 'table' });
    const table = document.getElementById('table');
    createAndAppend('tbody', table, { id: 'tbody' });
    function createTableRow(label, description) {
      const tRow = createAndAppend('tr', table);
      createAndAppend('td', tRow, { text: label, class: 'label' });
      createAndAppend('td', tRow, { text: description });
    }

    createTableRow('Repository: ', element.name);
    createTableRow('Description: ', element.description);
    createTableRow('Forks : ', element.forks);
    const date2 = new Date(element.updated_at).toLocaleString();
    createTableRow('Updated: ', date2);
  }

  // Show contributors
  function contributorsList(element) {
    fetchJSON(element.contributors_url).then(data => {
      const container = document.getElementById('container');
      createAndAppend('div', container, {
        id: 'rightArea',
        class: 'right-div whiteframe',
      });
      const rightArea = document.getElementById('rightArea');
      createAndAppend('h7', rightArea, {
        text: 'Contributions',
        class: 'contributor-header',
      });
      createAndAppend('ul', rightArea, {
        id: 'contList',
        class: 'contributor-list',
      });
      let contributorURL;
      let contributorItem;
      let contributorData;
      const contList = document.getElementById('contList');
      for (let i = 0; i < data.length; i++) {
        contributorURL = createAndAppend('a', contList, {
          href: data[i].html_url,
          target: '_blank',
        });
        contributorItem = createAndAppend('li', contributorURL, {
          class: 'contributor-item',
        });

        createAndAppend('img', contributorItem, {
          src: data[i].avatar_url,
          class: 'contributor-avatar',
        });
        contributorData = createAndAppend('div', contributorItem, {
          class: 'contributor-data',
        });
        createAndAppend('div', contributorData, { text: data[i].login });
        createAndAppend('div', contributorData, {
          text: data[i].contributions,
          class: 'contributor-badge',
        });
      }
    });
  }

  function main(url) {
    const root = document.getElementById('root');
    fetchJSON(url)
      .catch(reject => {
        createAndAppend('div', root, { text: reject.message, class: 'alert-error' });
      })
      .then(data => {
        createAndAppend('header', root, { id: 'topArea', class: 'header' });
        const topArea = document.getElementById('topArea');
        createAndAppend('h7', topArea, { id: 'title', text: 'HYF Repositories' });
        createAndAppend('select', topArea, { id: 'selectRepoHYF', class: 'repo-selector' });
        createAndAppend('div', root, { id: 'container' });
        data.sort((a, b) => a.name.localeCompare(b.name));
        selectOptions(data);
        displayInformation(data[0]);
        contributorsList(data[0]);

        document.getElementById('selectRepoHYF').onchange = function startListener() {
          const selectedItem = this.options[this.selectedIndex].value;
          const infoLeft = document.getElementById('leftArea');
          infoLeft.parentNode.removeChild(infoLeft);
          const contributors = document.getElementById('rightArea');
          contributors.parentNode.removeChild(contributors);

          displayInformation(data[selectedItem]);
          contributorsList(data[selectedItem]);
        };
      });
  }

  const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

  window.onload = () => main(HYF_REPOS_URL);
}
