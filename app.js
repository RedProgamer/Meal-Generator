const UISelectors = {
    userInput: '.user-input',
    searchBtn: '.search',
    randomMealGen: '.random',

    searchItem: '.search-item',
    cardsContainer: '.container-sm',

    readMoreBtn: '.read-more',

    dishInfo: '.dish-data',
    dishName: '.dish-name',
    dishPic: '.dish-picture',
    cuisine: '.cuisine',
    category: '.category',
    type: '.type',

    ingredients: '.main-list',
    instructions: '.list-group',

    cardBody: '.card-body',
    loading: '.loading'
};

async function getRandomRecipe() {
    const data = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const response = await data.json();

    return response;

}

async function getSpecificRecipe(recipe) {
    const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe}`);
    const response = await data.json();

    return response;
}

async function getRecipeById(id) {
    const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${parseInt(id)}`);
    const response = await data.json();

    return response;
};

function showDetailRecipe(e) {
    
    if(e.target.classList.contains('read-more')) {
        const cardId = e.target.id;
        getRecipeById(cardId).then(response => {
            showRecipeUI(response.meals[0]);
        });
    }

    e.preventDefault();
}

function showRecipeUI(data) {

    document.querySelector(UISelectors.dishInfo).style.display = 'block';

    // Scroll
    document.querySelector(UISelectors.dishInfo).scrollIntoView(true);

    let tags = "";

    document.querySelector(UISelectors.dishName).innerText = `${data.strMeal}`;
    document.querySelector(UISelectors.dishPic).setAttribute('src', data.strMealThumb);
    document.querySelector(UISelectors.cuisine).innerHTML = `Cuisine : <span class="badge rounded-pill bg-primary">${data.strArea}</span>`;
    document.querySelector(UISelectors.category).innerHTML = `Category : <span class="badge rounded-pill bg-primary">${isVegetable(data.strCategory)}</span>`

    // Add tags
    const recipeTags = getTags(data.strTags);
    recipeTags.forEach(function(item) {
        tags += `<span class="badge rounded-pill bg-primary">${item}</span> `;
    });

    document.querySelector(UISelectors.type).innerHTML = `Type: ${tags}`;

    // Ingrdients list
    const ingredients = getIngredientsList(data);
    const measurement = getIngredientsMeasurement(data);
    let mealMaker = formatMeal(ingredients, measurement);
    document.querySelector(UISelectors.ingredients).innerHTML = mealMaker;

    // Instruction
    const instructions = getInstructions(data);
    const instructionUI = formatInstructions(instructions);
    document.querySelector(UISelectors.instructions).innerHTML = instructionUI;

    

}

function showMsg(msg) {
    document.querySelector(UISelectors.searchItem).innerText = `${msg}`;
}

function isNotEmpty(str) {
    return str.length !== 0;
}

function isVegetable(str) {
    if(str === 'Vegetarian') {
        return 'Vegetarian';
    }else if(str === 'Chicken'){
        return 'Non Vegetarian';
    }else {
        return str;
    }
}

function getTags(str) {
    if(str === null)
        return ['None'];
    else {
        const tags = str.split(',');
        return tags;
    }
};

function getInstructions(data) {
    const str = data.strInstructions.split('.');
    str.splice(str.length-1, 1);
    return str;
}

function showRandomMeals(e) {
    document.querySelector(UISelectors.cardsContainer).style.display = 'none';
    document.querySelector(UISelectors.loading).style.display = 'block';

    getRandomRecipe().then(function(result) {
        showRecipeUI(result.meals[0]);
        document.querySelector(UISelectors.loading).style.display = 'none';
        document.querySelector(UISelectors.searchItem).style.display = 'none';
    }); 

    e.preventDefault();
}

function getRecipeData(e) {
    if(isNotEmpty(document.querySelector(UISelectors.userInput).value)) {
        const inputData = document.querySelector(UISelectors.userInput).value.trim();

        document.querySelector(UISelectors.searchItem).style.display = 'block';
        document.querySelector(UISelectors.dishInfo).style.display = 'none';
        document.querySelector(UISelectors.loading).style.display = 'block';
        
        getSpecificRecipe(inputData).then(function(result) { 
            generateInfo(result, inputData);
            fillCards(result);
            document.querySelector(UISelectors.loading).style.display = 'none';
        });
        
    }else {
        // alert();
    }

    e.preventDefault();
}

function fillCards(response) {
    let output = "";
    response.meals.forEach(function(items) {
        output += `
        <div class="card" style="width: 18rem;">
        <img src="${items.strMealThumb}" class="card-img-top" alt="${items.strMeal}">
            <div class="card-body">
            <h5 class="card-title">${items.strMeal}</h5>
            <p class="card-text">${items.strInstructions.substring(0, 100)}...</p>
            <button href="#" class="btn btn-primary read-more" id="${items.idMeal}">Read More</button>
            </div>
        </div>
        `;
    });

    document.querySelector(UISelectors.cardsContainer).innerHTML=  output;
    document.querySelector(UISelectors.cardsContainer).style.display = 'grid';
}

function generateInfo(data, recipe) {
    if(data.meals === null) {
        showMsg(`There are no search results for '${recipe}'. Try again!`);
        document.querySelector(UISelectors.loading).style.display = 'none';
        document.querySelector(UISelectors.cardsContainer).style.display = 'none';
    }else if(data.meals.length > 0) {
        showMsg(`${data.meals.length} search results for '${recipe}'`);

    }
}

function formatInstructions(lists) {
    let output = "";
    lists.forEach(function(item) {
        output += `<li class="list-group-item">${item}</li>`
    });

    return output;
}

function formatMeal(ingre, measure) {
    let output = "";
    for(let i = 0; i < ingre.length; i++) {
        output += `
        <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
            <label class="form-check-label" for="flexCheckDefault">
            ${measure[i]} ${ingre[i]}
            </label>
        </div>
        `;
    }

    return output;
}


function getIngredientsList(data) {
    const ingredients = [];

    for(let i = 1; i <= 20; i++) {
        if(data[`strIngredient${i}`]) {
            ingredients.push(data[`strIngredient${i}`]);
        }else {
            break;
        }
    }
    return ingredients;
}

function getIngredientsMeasurement(data) {
    const measurement = [];

    for(let i = 1; i <= 20; i++) {
        if(data[`strMeasure${i}`]) {
            measurement.push(data[`strMeasure${i}`]);
        }else {
            break;
        }
    }
    return measurement;
}

document.querySelector(UISelectors.searchBtn).addEventListener('click', getRecipeData);
document.querySelector(UISelectors.randomMealGen).addEventListener('click', showRandomMeals);
document.querySelector(UISelectors.cardsContainer).addEventListener('click', showDetailRecipe);






