function skillsMember() {
  var member = {
    name: 'John',
    age: 30,
    skills: ['JS', 'React', 'Node'],
    addSkill: function (skill) {
      this.skills.push(skill);
    },
  };
  return member;
}