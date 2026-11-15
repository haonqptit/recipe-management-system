const ingredientService = require('./ingredient.service');

class IngredientController {
  async listIngredients(req, res) {
    const { page, limit } = req.query;
    const result = await ingredientService.listIngredients({ page, limit });
    res.status(200).json({
      success: true,
      message: 'Ingredients retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getIngredientById(req, res) {
    const { id } = req.params;
    const ingredient = await ingredientService.getIngredientById(id);
    res.status(200).json({
      success: true,
      message: 'Ingredient retrieved successfully',
      data: ingredient,
    });
  }

  async createIngredient(req, res) {
    const { name, description, defaultUnit } = req.body;
    const result = await ingredientService.createIngredient({ name, description, defaultUnit });
    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: result,
    });
  }

  async updateIngredient(req, res) {
    const { id } = req.params;
    const { name, description, defaultUnit } = req.body;
    const result = await ingredientService.updateIngredient(id, { name, description, defaultUnit });
    res.status(200).json({
      success: true,
      message: 'Ingredient updated successfully',
      data: result,
    });
  }

  async deleteIngredient(req, res) {
    const { id } = req.params;
    const result = await ingredientService.deleteIngredient(id);
    res.status(200).json({
      success: true,
      message: 'Ingredient deleted successfully',
      data: result,
    });
  }

  async searchIngredients(req, res) {
    const { keyword, page, limit } = req.query;
    const result = await ingredientService.searchIngredients({ keyword, page, limit });
    res.status(200).json({
      success: true,
      message: 'Ingredients retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
}

module.exports = new IngredientController();
