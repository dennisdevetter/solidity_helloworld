const Crowdfunding = artifacts.require('./Crowdfunding.sol')

contract('Crowdfunding', (accounts) => {
    let crowdfunding

    const beneficiary = accounts[0]

    const ONE_ETH = web3.utils.toWei('1', 'ether')
    const ONGOING_STATE = '0'
    const FAILED_STATE = '1'
    const SUCCEEDED_STATE = '2'
    const PAID_OUT_STATE = '3'

    beforeEach(async () => {
        crowdfunding = await Crowdfunding.new(
            'campaign name',
            1,
            10,
            beneficiary,
            { from : beneficiary, gas: 2000000 }
        )
    })

    it('contract is initialized', async () =>{
        const targetAmout = await crowdfunding.targetAmount()        
        expect(targetAmout.toString()).to.equal(ONE_ETH.toString())

        const actualName = await crowdfunding.name()
        expect(actualName).to.equal('campaign name')

        const actualBeneficiary = await crowdfunding.beneficiary()
        expect(actualBeneficiary).to.equal(beneficiary)

        const state = await crowdfunding.state()
        expect(state.toString()).to.equal(ONGOING_STATE)
    })

    it('accepts ETH contributions', async () =>{
        await crowdfunding.sendTransaction({value: ONE_ETH, from: accounts[1]})        
        
        const contributed = await crowdfunding.amounts(accounts[1])
        expect(contributed.toString()).to.equal(ONE_ETH.toString())
        
        const totalCollected = await crowdfunding.totalCollected()
        expect(totalCollected.toString()).to.equal(ONE_ETH.toString())
    })

    it('does not allow to contribute after deadline', async () =>{
        try {
            await increaseTime(601) // 10 minutes + 1 second
            await mineBlock()
            await crowdfunding.sendTransaction({value: ONE_ETH, from: accounts[1]})        

            expect.fail('should revert execution')
        } catch (error) {            
             expect(error.message).to.include('Deadline has passed')
        }
    })

    it('sets state correctly when campaign fails', async () =>{
        await increaseTime(601) // 10 minutes + 1 second
        await mineBlock()
        await crowdfunding.finishCrowdfunding()

        const fundingState = await crowdfunding.state.call()
        expect(fundingState.toString()).to.equal(FAILED_STATE)
    })

    it('sets state correctly when campaign succeeds', async () =>{
        await crowdfunding.sendTransaction({value: ONE_ETH, from: accounts[1]})        
        await increaseTime(801) // 10 minutes + 1 second
        await mineBlock()
        await crowdfunding.finishCrowdfunding()

        const fundingState = await crowdfunding.state.call()
        expect(fundingState.toString()).to.equal(SUCCEEDED_STATE)
    })
})

async function increaseTime(increaseBySec) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [increaseBySec]
            },
            (error, result) => {                
                if (error) {
                    reject(error)
                    return
                }
                resolve(result)
            }
        )
    })    
}

async function mineBlock() {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_mine',                
            },
            (error, result) => {                
                if (error) {
                    reject(error)
                    return
                }
                resolve(result)
            }
        )
    })    
}
