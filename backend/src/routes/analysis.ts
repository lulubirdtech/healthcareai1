import express from 'express';
import { auth } from '../middleware/auth.js';
import { Analysis } from '../models/Analysis.js';
import { DicomFile } from '../models/DicomFile.js';

interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Start analysis endpoint
router.post('/analyze', auth, async (req: AuthRequest, res) => {
  try {
    const { dicomFileId, modelType = 'general', sensitivity = 'standard' } = req.body;

    // Find the DICOM file
    const dicomFile = await DicomFile.findById(dicomFileId);
    if (!dicomFile) {
      return res.status(404).json({ message: 'DICOM file not found' });
    }

    // Create analysis record
    const analysis = new Analysis({
      dicomFileId,
      userId: req.user!.userId,
      status: 'processing',
      modelType,
      sensitivity,
      createdAt: new Date()
    });
    await analysis.save();

    // Simulate AI analysis (async)
    setTimeout(async () => {
      try {
        analysis.status = 'completed';
        analysis.findings = [
          {
            type: 'Nodule',
            description: 'Small pulmonary nodule identified in right upper lobe',
            location: { x: 150, y: 200, width: 20, height: 20 },
            confidence: 0.85,
            severity: 'medium' as const
          }
        ];
        analysis.confidence = 0.85;
        analysis.processingTime = Date.now() - analysis.createdAt.getTime();
        await analysis.save();
      } catch (error) {
        console.error('AI analysis error:', error);
        analysis.status = 'failed';
        analysis.error = error instanceof Error ? error.message : 'Analysis failed';
        await analysis.save();
      }
    }, 5000);

    res.json({
      analysisId: analysis._id.toString(),
      status: 'processing',
      message: 'Analysis started successfully'
    });
  } catch (error) {
    console.error('Analysis request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get analysis results
router.get('/:analysisId', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.analysisId)
      .populate('dicomFileId')
      .populate('userId', 'name email');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List user's analyses
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (status) {
      filter.status = status;
    }

    const analyses = await Analysis.find(filter)
      .populate('dicomFileId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Analysis.countDocuments(filter);

    res.json({
      analyses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('List analyses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as analysisRoutes };