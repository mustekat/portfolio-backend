const deleteImage = (fileName, clickedButton) => {
  const confirmed = confirm(
    `Do you really want to permanently delete ${fileName}?`
  );
  if (confirmed) {
    const req = new XMLHttpRequest();
    req.onload = () => {
      // Remove from otherImages
      clickedButton.closest('.item').remove();
    };
    req.open('DELETE', `${apiPath}/images/${fileName}`);
    req.send();
  }
};

let currentList = imageList.split(',');
// The position of item name element in an image-list item element
const nameIndex = 1;

const updateList = () => {
  const container = document.getElementById('image-list');
  const exampleItem = document.getElementById('example-item');
  const listInput = document.getElementById('list-input');
  listInput.value = currentList.join(',');
  container.innerHTML = '';
  for (var i = 0; i < currentList.length; i++) {
    const current = currentList[i];
    const newItem = exampleItem.cloneNode(true);
    newItem.removeAttribute('id');
    newItem.childNodes[nameIndex].innerHTML = current;
    container.appendChild(newItem);
  }
};

const getItemIndex = clickedButton => {
  try {
    const name = clickedButton.closest('.item').childNodes[nameIndex].innerText;
    return currentList.indexOf(name);
  } catch (err) {
    return -1;
  }
};

const moveUp = clickedButton => {
  const index = getItemIndex(clickedButton);
  if (index > 0) {
    const els = currentList.splice(index, 1);
    currentList.splice(index - 1, 0, els[0]);
    updateList();
  }
};

const moveDown = clickedButton => {
  const index = getItemIndex(clickedButton);
  if (index > -1 && index < currentList.length - 1) {
    const els = currentList.splice(index, 1);
    currentList.splice(index + 1, 0, els[0]);
    updateList();
  }
};

const remove = clickedButton => {
  const index = getItemIndex(clickedButton);
  if (index !== -1) {
    currentList.splice(index, 1);
    updateList();
  }
};

const addToList = (fileName, clickedButton) => {
  currentList.push(fileName);
  updateList();
  // Remove from otherImages
  clickedButton.closest('.item').remove();
};

updateList();
