import Groups from "../../groups/schema.js";

const onlyOwner = async (req, res, next) => {
  const group = await Groups.findById(req.params.id);
  if (group.leader._id.toString() !== req.user._id.toString()) {
    res
      .status(403)
      .send({ message: "You are not the owner of this group post!" });
    return;
  } else {
    req.group = group;
    next();
  }
};

export default onlyOwner;
