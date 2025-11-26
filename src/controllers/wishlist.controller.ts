import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlist.service.js';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const wishlistItems = await wishlistService.getWishlist(userId);

    res.status(200).json({
      success: true,
      data: wishlistItems,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wishlist',
    });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const wishlistItem = await wishlistService.addToWishlist(userId, productId);

    res.status(201).json({
      success: true,
      data: wishlistItem,
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add to wishlist',
    });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    const result = await wishlistService.removeFromWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Item not found in wishlist') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove from wishlist',
    });
  }
};

export const checkWishlistStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    const isInWishlist = await wishlistService.isInWishlist(userId, productId);

    res.status(200).json({
      success: true,
      data: { isInWishlist },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check wishlist status',
    });
  }
};


