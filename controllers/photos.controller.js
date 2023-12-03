const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');


/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const ExtensionsRegex = /\.(jpg|jpeg|png|gif)$/i;

      const htmlRegex = /<[^>]*>?/gm;
      const emailRegex = /@/;

      if (!htmlRegex.test(title) && !htmlRegex.test(author) && !htmlRegex.test(email)) {
        if (ExtensionsRegex.test(fileName)) {
          if (title.length <= 25 && author.length <= 50) {
            if (emailRegex.test(email)) {
              const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
              await newPhoto.save();
              res.json(newPhoto);
            } else {
              throw new Error('Invalid email format! Must contain "@" symbol');
            }
          } else {
            if (title.length > 25) {
              throw new Error('Title exceeds maximum length (25 characters)');
            } else {
              throw new Error('Author exceeds maximum length (50 characters)');
            }
          }
        } else {
          throw new Error('Invalid file format! Allowed formats: jpg, jpeg, png, gif');
        }
      } else {
        throw new Error('HTML code is not allowed in fields (title, author, email)');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/


exports.loadAllVotes = async (req, res) => {

  try {
    res.json(await Voter.find());
  } catch (err) {
    res.status(500).json(err);
  }

};


exports.vote = async (req, res) => {
  try {
    const voterIp = requestIp.getClientIp(req);
    console.log('ip', voterIp);
    const photoId = req.params.id;

    const voter = await Voter.findOne({ user: voterIp });

    if (!voter) {
      const newVoter = new Voter({ user: voterIp, votes: [photoId] });
      await newVoter.save();

      const photoToUpdate = await Photo.findOne({ _id: photoId });
      if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
      else {
        photoToUpdate.votes++;
        await photoToUpdate.save();
        res.send({ message: 'OK' });
      }
    } else {
      if (!voter.votes.includes(photoId)) {
        voter.votes.push(photoId);
        await voter.save();

        const photoToUpdate = await Photo.findOne({ _id: photoId });
        if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
        else {
          photoToUpdate.votes++;
          await photoToUpdate.save();
          res.send({ message: 'OK' });
        }
      } else {
        return res.status(500).json({ message: 'Already voted for this photo!' });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
};