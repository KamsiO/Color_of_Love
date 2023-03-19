class BeeswarmPlot {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        margin: {}
      }
      this.data = _data;

      this.initVis();
    }
    
    initVis() {
      let vis = this;
  
      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;
      
      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;
    }

  
}