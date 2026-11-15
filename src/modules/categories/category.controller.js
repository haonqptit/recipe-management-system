const categoryService = require('./category.service');

class CategoryController {
  async listCategories(req, res) {
    const { page, limit } = req.query;
    const result = await categoryService.listCategories({ page, limit });
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getCategoryById(req, res) {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  }

  async createCategory(req, res) {
    const { name, description, imageUrl } = req.body;
    const result = await categoryService.createCategory({ name, description, imageUrl });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  }

  async updateCategory(req, res) {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    const result = await categoryService.updateCategory(id, { name, description, imageUrl });
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result,
    });
  }

  async deleteCategory(req, res) {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: result,
    });
  }

  async getRecipesByCategory(req, res) {
    const { id } = req.params;
    const { page, limit, sort } = req.query;
    const result = await categoryService.getRecipesByCategory(id, { page, limit, sort });
    res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
}

module.exports = new CategoryController();
