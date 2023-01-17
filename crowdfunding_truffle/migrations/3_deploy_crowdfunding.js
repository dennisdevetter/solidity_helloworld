const Crowdfunding = artifacts.require('./Crowdfunding.sol')

module.exports = function(deployer) {
  deployer.deploy(
    Crowdfunding,
    'Test campaign',
    1, // amount of ether to collect
    5 * 24 * 60, // 5 days(in minutes) until deadline
    '0xcBE8e2Ffff23eED7482408C149B3d9D597cD00a3'
  )
}