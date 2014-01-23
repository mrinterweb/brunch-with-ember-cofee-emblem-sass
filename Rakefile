require 'yaml'
require 'pry'

module Support
  class Config
    CONFIG_DIR = 'rake_support/config'
    VENDOR_MAP = "#{CONFIG_DIR}/vendor_map.yml"

    attr_reader :hash

    def initialize(config)
      case config
      when :vendor_map
        @hash = load_yaml(VENDOR_MAP)
      else
        raise "Config mapping undefined for: #{config}"
      end
    end

    def load_yaml(file)
      YAML.load_file(file)
    end
  end
end

module FileSupport
  require 'json'
  require 'open-uri'

  def parse_name(path)
    path.match(%r~.*[/](?<name>.+)$~)[:name]
  end

  def grab_json(url)
    begin
      JSON.parse(download(url).read)
    rescue
      puts "There was a problem fetching y'r JSON"
    end
  end

  def download(url)
    begin
      puts "Downloading: #{url}"
      tmp_file = open(url)
      puts "downloaded #{tmp_file.size / 1024}KB"
      tmp_file
    rescue OpenURI::HTTPError
      puts "Download failed: #{url}"
    end
  end

  def download_and_move(url, destination)
    tmp_file = download(url)
    File.rename tmp_file, destination
  end

  def github_url_to_raw(url)
    url.sub("https://", "https://raw2.").sub('blob/', '')
  end
end

namespace :update do
  include FileSupport
  
  desc "upgrade ember.js and ember-data.js files takes optional argument of release, stable, canary"
  task :upgrade_ember, :version do |t, args|
    release = args[:version] || 'release'
    detect_version = ->(file) { File.readlines(file).detect { |l| l =~ /@version/ } }

    ember_path = './vendor/scripts/ember.js'

    if File.exists?(ember_path)
      puts "Existing ember version: #{detect_version.call(File.open(ember_path, 'r'))}"
    end

    %w[ember.js ember.min.js ember.prod.js ember-data.js ember-data.prod.js ember-data.min.js].each do |file_name|
      url = "http://builds.emberjs.com/#{release}/#{file_name}"
      download_and_move(url, "./vendor/scripts/#{file_name}")
      if file_name == 'ember.js'
        ember_file = File.open("./vendor/scripts/#{file_name}", 'r')
        puts "Downloaded version: #{detect_version.call(ember_file)}"
      end
    end
  end

  desc "upgrade emblem"
  task :upgrade_emblem do
    emblem_url = "https://github.com/machty/emblem.js/raw/master/dist/emblem.js"
    # need to find the most recent version of handlebars being used.
    # will use the github api to check what the most recent version the tests are using
    # this is a pretty brittle way of determining the dependency
    contents = grab_json 'https://api.github.com/repos/machty/emblem.js/contents/test/resources'
    latest_handlebars_name = contents.map { |e| e['name'] }.select { |name| name =~ /^handlebars-/ }.last
    handlebars_url = contents.detect { |e| e['name'] == latest_handlebars_name }['_links']['html']
    handlebars_name = parse_name(handlebars_url)

    puts "Downloading emblem: #{handlebars_url}"
    download_and_move(github_url_to_raw(handlebars_url), "./vendor/scripts/#{handlebars_name}")

    # download emblem
    contents = grab_json 'https://api.github.com/repos/machty/emblem.js/contents/dist'
    contents.each do |entry|
      download_and_move(github_url_to_raw(entry['_links']['html']), "./vendor/scripts/#{entry['name']}")
    end
  end


  desc "link one or more specified libs and dependencies"
  task :link_libs do |t, args|
    libs = args.extras
  end

  desc "link all known libs"
  task :link_all do

  end
end

namespace :install do
  include Support
  
  desc "install latest jquery 1.x"
  task "jquery_1x", :option do |t, args|
    task('install:jquery').invoke('1x', args[:option])
  end

  desc "install latest jquery 2.x"
  task "jquery_2x", :option do |t, args|
    puts 'jquery_2x task called'
    task('install:jquery').invoke('2x', args[:option])
  end

  desc "install specific version of jquery"
  task :jquery, :version, :option do |t, args|
    puts 'jquery task called'
    puts args.inspect
    version = args[:version]
    option = args[:option]
    option = 'uncompressed' unless %w[uncompressed minified].include?(option)

    conf = Support::Config.new(:vendor_map)

    begin
      url = conf.hash['jquery'][version][option]
    rescue
      begin
        url = conf.hash['jquery']['generic'][option]
        url.sub!('<version>', version)
      rescue NoMethodError => e
        raise "unable to find jquery with: version -> #{version}, option -> #{option}"
      end
    end
    download_and_move(url, "./vendor/scripts/#{parse_name(url)}")
  end
end

