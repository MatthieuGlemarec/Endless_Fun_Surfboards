const express = require('express');
const router = express.Router();
const Surfboard = require('../models/surfboards');
const { isLoggedIn } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const { cloudinary } = require('../cloudinary');
const upload = multer({ storage });



router.get('/', async (req, res) => {
    const surfboards = await Surfboard.find({});
    res.render('pages/surfboards', { surfboards })
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('pages/new')
});

router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
    const surfboard = new Surfboard(req.body.surfboard);
    surfboard.image = { url: req.file.path, filename: req.file.filename }
    await surfboard.save();
    req.flash('success', 'Successfully created a new model');
    res.redirect('/surfboards')
});



router.get('/:id/edit', isLoggedIn, async (req, res) => {
    const surfboard = await Surfboard.findById(req.params.id);
    if (!surfboard) {
        req.flash('danger', 'Can not find that model');
        return res.redirect('/surfboards')
    };
    res.render('pages/edit', { surfboard })
});

router.put('/:id', isLoggedIn, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const surfboard = await Surfboard.findByIdAndUpdate(id, { ...req.body.surfboard });
    if (req.body.deleteImage) {
        await cloudinary.uploader.destroy(req.body.deleteImage);
    };
    await surfboard.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } } } })
    if (req.file) {

        surfboard.image = { url: req.file.path, filename: req.file.filename }
    };
    await surfboard.save();
    req.flash('success', 'Successfully updated model');
    res.redirect('/surfboards')
});

router.get('/:id', isLoggedIn, async (req, res) => {
    const surfboard = await Surfboard.findById(req.params.id);
    res.render('pages/delete', { surfboard })
});

router.delete('/:id', isLoggedIn, async (req, res) => {
    const surfboard = await Surfboard.findById(req.params.id)
    const { id } = req.params;
    const image = surfboard.image[0].filename
    await cloudinary.uploader.destroy(image);
    await Surfboard.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted model');
    res.redirect('/surfboards')
});

module.exports = router;