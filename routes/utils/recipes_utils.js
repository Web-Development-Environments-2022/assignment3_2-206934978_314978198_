const axios = require("axios");
const { get } = require("../recipes");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeInstructions(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
}

/*
 * This func returns a details of a recipe by it's id
*/
async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
    };

}


/*
 * This func returns recipes by a query and it's amount of results
*/
async function getSearchRecipes(req, query, number, cuisine, diet, intolerances) {
    let res = await axios.get(`${api_domain}/complexSearch`,
    {
        params: {
            apiKey: process.env.spooncular_apiKey,
            query: query, 
            number: number,
            cuisine: cuisine, 
            diet: diet,
            intolerances: intolerances,
            instructionsRequired: true,
            addRecipeInformation: true,
        },
    })

    const dct = res.data['results'];
    let result_id = [];
    const len = dct.length;

    for(let i = 0; i < Object.keys(dct).length; i++)
    {    
        result_id[i] = dct[i]['id'];
    }
    
    return result_id;
}

/*
 * This func returns three random recipes
*/
async function threeRandomRecipes(){
    const data =  await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return data;
}


/*
 * This func calls the threeRandomRecipes above
*/
async function getRandomRecipes() {
    let threeRecipes = await threeRandomRecipes();
    return threeRecipes.data;
}   


/*
 * This func returns the last three recipes which were watched by a specific user
*/
async function getLastThreeRecipes(user_name){
    const recipes = await DButils.execQuery(`SELECT rec_id FROM mydb.watched WHERE user_name='${user_name}' ORDER BY date desc limit 3`);
    return recipes;
}

/*
 * This func addes the last recipe were watched by a specific user
*/
async function postLastRecipe(user_name, recipe_id){
    await DButils.execQuery(`insert into mydb.watched values(${recipe_id}, '${user_name}', NOW())`);
}

/*
 * This func returns the full details of a recipe by it's id
*/
async function getFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, servings } = recipe_info.data;
    let instructions = await getRecipeInstructions(recipe_id);
    let analyze_Instructions = instructions.data;
    
    const fullDetails = {
        id: id,
        imageUrl: image,
        title: title,
        readyInMinutes: readyInMinutes,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
        ingredients: extendedIngredients,
        analyze_Instructions: analyze_Instructions,
        servings: servings,
    }

    return fullDetails;
}




exports.getRecipeDetails = getRecipeDetails;
exports.getSearchRecipes = getSearchRecipes;
exports.getRandomRecipes = getRandomRecipes;
exports.getLastThreeRecipes = getLastThreeRecipes;
exports.getFullDetailsOfRecipe = getFullDetailsOfRecipe;
exports.postLastRecipe = postLastRecipe;