//changer la langue en français

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendWhatsAppMessage } = require('../Whatsapp');
const multer = require('../middleware/upload'); 
const cloudinary = require('../config/cloudinary'); 

const createClient = async (req, res) => {
  try {
    const { name, number, city, password } = req.body;

    if (!name || !number || !password) {
      return res.status(400).json({
        success: false,
        message: '❌ Le nom, le numéro et le mot de passe sont requis.'
      });
    }

    const cleanNumber = number.replace(/\D/g, '');
    const adminId = req.user.createdByAdmin || req.user.assignedAdmin || req.user._id;

    const existingClient = await User.findOne({
      number: cleanNumber,
      createdByAdmin: adminId,
      role: 'client'
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: '❌ Ce numéro est déjà utilisé par le même administrateur.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const clientData = {
      role: 'client',
      name,
      number: cleanNumber,
      city,
      password: hashedPassword,
      createdByVendor: req.user._id,
      createdByAdmin: adminId
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clients' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });
      clientData.img = result.secure_url;
      clientData.imgPublicId = result.public_id;
    }

    const client = await User.create(clientData);

    const message = `Bonjour ${name},\nNuméro de téléphone : ${cleanNumber}\nMot de passe : ${password}`;
    await sendWhatsAppMessage(cleanNumber, message);


    res.status(201).json({
      success: true,
      message: '✅ Le client a été créé avec succès et un message WhatsApp a été envoyé.',
      client: {
        _id: client._id,
        name: client.name,
        number: client.number,
        city: client.city,
        img: client.img,
        createdAt: client.createdAt
      }

    });

  } catch (err) {
    console.error('❌ Erreur lors de la création du client :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur du serveur',
      error: err.message
    });
  }
};



const editClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await User.findById(clientId);

    if (!client) return res.status(404).json({ message: '❌ العميل غير موجود' });
    if (client.createdByVendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ غير مصرح لك بالتعديل' });
    }

    const updates = req.body;

    if (updates.number && updates.number !== client.number) {
      const adminId = client.createdByAdmin;
      const existingClient = await User.findOne({
        number: updates.number.replace(/\D/g, ''),
        createdByAdmin: adminId,
        role: 'client',
        _id: { $ne: clientId }
      });
      if (existingClient) {
        return res.status(400).json({ message: '❌ هذا الرقم مستخدم مسبقًا عند نفس الأدمن' });
      }
      updates.number = updates.number.replace(/\D/g, '');
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (req.file) {
      if (client.imgPublicId) await cloudinary.uploader.destroy(client.imgPublicId);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clients' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    const updatedClient = await User.findByIdAndUpdate(clientId, updates, { new: true }).select('-password');

    res.json({
      success: true,
      message: '✅ تم تعديل العميل بنجاح',
      client: updatedClient
    });

  } catch (err) {
    console.error('❌ خطأ أثناء تعديل العميل:', err);
    res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};

const toggleClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await User.findById(clientId);

    if (!client) return res.status(404).json({ message: '❌ العميل غير موجود' });

    if (client.createdByVendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ غير مصرح لك' });
    }

    client.disabled = !client.disabled;
    await client.save();

    res.json({
      success: true,
      message: `✅ العميل ${client.disabled ? 'تم تعطيله' : 'تم تفعيله'} بنجاح`,
      client: {
        _id: client._id,
        name: client.name,
        number: client.number,
        disabled: client.disabled
      }
    });

  } catch (err) {
    console.error('❌ خطأ أثناء تفعيل/تعطيل العميل:', err);
    res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};

const getMyClients = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const clients = await User.find({ role: 'client', createdByVendor: vendorId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'تم جلب العملاء بنجاح',
      clients,
      count: clients.length
    });

  } catch (err) {
    console.error('❌ خطأ أثناء جلب العملاء:', err);
    res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};

module.exports = {
  createClient,
  editClient,
  toggleClient,
  getMyClients
};
